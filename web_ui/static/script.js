document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       STATE & ELEMENTS
       ========================================= */
    const views = {
        setup: document.getElementById('view-setup'),
        interview: document.getElementById('view-interview'),
        results: document.getElementById('view-results')
    };

    const navItems = {
        setup: document.querySelector('[data-target="setup"]'),
        interview: document.querySelector('[data-target="interview"]'),
        results: document.querySelector('[data-target="results"]')
    };

    const els = {
        cvUpload: document.getElementById('cv-upload'),
        jdUpload: document.getElementById('jd-upload'),
        analyzeBtn: document.getElementById('analyze-btn'),
        skipSetupBtn: document.getElementById('skip-setup-btn'),
        analysisOverlay: document.getElementById('analysis-overlay'),

        // Setup Result Elements (dynamically added if missing in HTML, but we'll inject using JS for now)
        setupResultContainer: null,

        startInterviewBtn: document.getElementById('start-interview-btn'),
        activeButtons: document.getElementById('active-buttons'),
        recordAnswerBtn: document.getElementById('record-answer-btn'),
        stopAnswerBtn: document.getElementById('stop-answer-btn'),

        chatHistory: document.getElementById('chat-history'),
        interviewerAudio: document.getElementById('interviewer-audio'),
        liveSttText: document.getElementById('live-stt-text'),

        video: document.getElementById('webcam'),
        canvas: document.getElementById('overlay'),
        proctorBadge: document.getElementById('proctor-badge'),
        warningToast: document.getElementById('warning-toast'),
        warningMsg: document.getElementById('warning-msg'),

        finalScore: document.getElementById('final-score-display'),
        integrityStatus: document.getElementById('integrity-status'),
        violationCount: document.getElementById('violation-count'),
        weaknessList: document.getElementById('weakness-list')
    };

    let state = {
        isMonitoring: false,
        model: null,
        proctorViolations: 0,
        interviewRecognition: null,
        wavRecorder: null,
        currentStep: 'setup',
        analysisDone: false
    };

    const ALERT_THRESHOLD = 500;
    let lastFaceDetectedTime = Date.now();

    // Check for existing session data on load
    // checkSessionPersistence(); // Disabled to force fresh start

    function checkSessionPersistence() {
        // Disabled
    }

    /* =========================================
       NAVIGATION LOGIC
       ========================================= */
    function navigateTo(viewName) {
        // Update View
        Object.values(views).forEach(el => el.classList.remove('active', 'hidden'));
        Object.values(views).forEach(el => el.classList.add('hidden'));
        views[viewName].classList.remove('hidden');
        views[viewName].classList.add('active');

        // Update Nav status
        Object.values(navItems).forEach(el => el.classList.remove('active'));
        if (navItems[viewName]) navItems[viewName].classList.add('active');
        if (navItems[viewName]) navItems[viewName].classList.remove('disabled');

        // Update Title
        const titles = {
            setup: "Session Setup",
            interview: "AI Interview Session",
            results: "Performance Report"
        };
        document.getElementById('page-title').textContent = titles[viewName];

        // Save state
        localStorage.setItem('currentStep', viewName);
        state.currentStep = viewName;
    }

    /* =========================================
       SETUP STEP
       ========================================= */
    function handleFileUpload(input, dropArea) {
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                dropArea.classList.add('uploaded');
                dropArea.querySelector('.file-label').textContent = input.files[0].name;
                dropArea.querySelector('i').className = "fa-solid fa-check-circle";
            }
        });
        dropArea.addEventListener('click', () => input.click());
    }

    handleFileUpload(els.cvUpload, document.getElementById('drop-cv'));
    handleFileUpload(els.jdUpload, document.getElementById('drop-jd'));

    // CREATE RESULT DISPLAY AREA IN SETUP
    const uploadBox = document.querySelector('.upload-box');
    const resultDiv = document.createElement('div');
    resultDiv.id = "analysis-result-ui";
    resultDiv.className = "analysis-result hidden";
    resultDiv.style.marginTop = "20px";
    resultDiv.style.textAlign = "center";
    uploadBox.appendChild(resultDiv);
    els.setupResultContainer = resultDiv;

    els.analyzeBtn.addEventListener('click', () => {
        if (!els.cvUpload.files[0] || !els.jdUpload.files[0]) {
            alert("Please provide both documents.");
            return;
        }

        els.analysisOverlay.classList.remove('hidden');
        const formData = new FormData();
        formData.append('cv_file', els.cvUpload.files[0]);
        formData.append('jd_file', els.jdUpload.files[0]);

        fetch('/upload_analysis', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                els.analysisOverlay.classList.add('hidden');
                if (data.error) { alert(data.error); return; }

                // SHOW SCORE AND "NEXT" BUTTON
                state.analysisDone = true;
                els.analyzeBtn.classList.add('hidden');
                els.skipSetupBtn.classList.add('hidden');

                els.setupResultContainer.classList.remove('hidden');
                els.setupResultContainer.innerHTML = `
                    <div style="background:#f0fdf4; color:#166534; padding:15px; border-radius:8px; margin-bottom:15px;">
                        <h3><i class="fa-solid fa-check-circle"></i> Match Found: ${data.score}%</h3>
                        <p>Your profile has been analyzed. We are ready to begin.</p>
                    </div>
                    <button id="proceed-btn" class="btn btn-primary btn-lg">
                        Proceed to Interview <i class="fa-solid fa-arrow-right"></i>
                    </button>
                `;

                document.getElementById('proceed-btn').addEventListener('click', () => {
                    navigateTo('interview');
                    initMedia();
                });
            })
            .catch(err => {
                els.analysisOverlay.classList.add('hidden');
                alert("Analysis Error: " + err);
            });
    });

    els.skipSetupBtn.addEventListener('click', () => {
        navigateTo('interview');
        initMedia();
    });

    /* =========================================
       MEDIA & PROCTORING (ENHANCED)
       ========================================= */
    async function initMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
            els.video.srcObject = stream;

            // Init AI Model for Proctoring
            addChatMessage('system', 'Initializing System...');
            state.model = await blazeface.load();
            state.isMonitoring = true;
            detectFaces();
            addChatMessage('system', 'System Ready. Please press "Start Interview".');

            document.getElementById('ai-status').querySelector('.dot').classList.replace('disconnected', 'connected');
        } catch (e) {
            console.error(e);
            alert("Camera access denied. Please allow camera access.");
        }
    }

    async function detectFaces() {
        if (!state.isMonitoring || !state.model) return;

        const ctx = els.canvas.getContext('2d');
        if (els.canvas.width !== els.video.videoWidth) {
            els.canvas.width = els.video.videoWidth;
            els.canvas.height = els.video.videoHeight;
        }

        const predictions = await state.model.estimateFaces(els.video, false);
        ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);

        if (predictions.length > 0) {
            lastFaceDetectedTime = Date.now();
            const pred = predictions[0];

            // Visual Box
            const start = pred.topLeft;
            const end = pred.bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(start[0], start[1], size[0], size[1]);

            // Gaze Logic (Heuristic based on landmarks)
            const land = pred.landmarks;
            const nose = land[2];
            const rEar = land[4];
            const lEar = land[5];
            const rEye = land[0];
            const lEye = land[1];

            const faceWidth = Math.abs(rEar[0] - lEar[0]);
            const faceHeight = Math.abs(nose[1] - (rEye[1] + lEye[1]) / 2) * 3; // Approx

            let warning = null;

            // Left/Right
            if (Math.abs(nose[0] - rEar[0]) < faceWidth * 0.20) warning = "Looking Right";
            else if (Math.abs(nose[0] - lEar[0]) < faceWidth * 0.20) warning = "Looking Left";

            // Up/Down (Heuristic)
            const eyeLevel = (rEye[1] + lEye[1]) / 2;
            const noseY = nose[1];
            const upperFaceHeight = Math.abs(noseY - eyeLevel);

            // If nose is surprisingly close to eye level -> Looking Up
            if (upperFaceHeight < faceWidth * 0.12) warning = "Looking Up";

            // If nose is surprisingly far from eye level -> Looking Down
            if (upperFaceHeight > faceWidth * 0.40) warning = "Looking Down";

            if (predictions.length > 1) warning = "Multiple Faces";

            updateProctorUI(warning);
        } else {
            if (Date.now() - lastFaceDetectedTime > ALERT_THRESHOLD) updateProctorUI("No Face Detected");
        }

        requestAnimationFrame(detectFaces);
    }

    function updateProctorUI(warning) {
        if (warning) {
            state.proctorViolations++;
            els.proctorBadge.className = "badge badge-warning";
            els.proctorBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Alert`;
            els.warningToast.classList.remove('hidden');
            els.warningMsg.textContent = warning;
        } else {
            els.proctorBadge.className = "badge badge-success";
            els.proctorBadge.innerHTML = `<i class="fa-solid fa-check"></i> Secure`;
            els.warningToast.classList.add('hidden');
        }
    }

    /* =========================================
       AUDIO UTILITIES (WAV RECORDER)
       ========================================= */
    // Helper to record 16-bit PCM WAV which is required by Python's wave/speech_recognition modules
    // Standard MediaRecorder often outputs WebM which can fail without ffmpeg
    class WavRecorder {
        constructor() {
            this.audioContext = null;
            this.mediaStream = null;
            this.scriptProcessor = null;
            this.audioInput = null;
            this.chunks = [];
            this.recordingLength = 0;
            this.sampleRate = 44100;
            this.recording = false;
        }

        async start() {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sampleRate = this.audioContext.sampleRate;
            this.chunks = [];
            this.recordingLength = 0;

            try {
                this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (error) {
                console.error('Mic Access Error:', error);
                throw error;
            }

            this.audioInput = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.scriptProcessor.onaudioprocess = (e) => {
                if (!this.recording) return;
                const channelData = e.inputBuffer.getChannelData(0);
                this.chunks.push(new Float32Array(channelData));
                this.recordingLength += channelData.length;
            };

            this.audioInput.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.audioContext.destination);
            this.recording = true;
        }

        stop() {
            return new Promise((resolve) => {
                this.recording = false;
                setTimeout(() => {
                    if (this.scriptProcessor) this.scriptProcessor.disconnect();
                    if (this.audioInput) this.audioInput.disconnect();
                    if (this.mediaStream) this.mediaStream.getTracks().forEach(track => track.stop());

                    resolve(this.exportWAV());
                    if (this.audioContext) this.audioContext.close();
                }, 100);
            });
        }

        mergeBuffers(channelBuffer, recordingLength) {
            const result = new Float32Array(recordingLength);
            let offset = 0;
            for (let i = 0; i < channelBuffer.length; i++) {
                result.set(channelBuffer[i], offset);
                offset += channelBuffer[i].length;
            }
            return result;
        }

        exportWAV() {
            const buffer = this.mergeBuffers(this.chunks, this.recordingLength);
            const wavBuffer = new ArrayBuffer(44 + buffer.length * 2);
            const view = new DataView(wavBuffer);
            const writeString = (view, offset, string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };

            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + buffer.length * 2, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, this.sampleRate, true);
            view.setUint32(28, this.sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            writeString(view, 36, 'data');
            view.setUint32(40, buffer.length * 2, true);

            // Float to 16-bit PCM
            let offset = 44;
            for (let i = 0; i < buffer.length; i++, offset += 2) {
                let s = Math.max(-1, Math.min(1, buffer[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }

            return new Blob([view], { type: 'audio/wav' });
        }
    }

    /* =========================================
       INTERVIEW LOGIC (Modified to use WavRecorder)
       ========================================= */

    // Web Speech API for Live Transcription Feedback
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        state.interviewRecognition = new SpeechRecognition();
        state.interviewRecognition.continuous = true;
        state.interviewRecognition.interimResults = true;
        state.interviewRecognition.onresult = (event) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                interim += event.results[i][0].transcript;
            }
            els.liveSttText.textContent = interim;
        };
    }

    els.startInterviewBtn.addEventListener('click', () => {
        els.startInterviewBtn.style.display = 'none';
        els.activeButtons.classList.remove('hidden');

        // Don't auto-reset if we are continuing?
        // For simplicity, we assume hitting "Start" implies a reset or new question.
        // But better to check.
        fetch('/interview/reset', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                addChatMessage('assistant', data.question);
                playAudio(data.audio_url);
                state.wavRecorder = new WavRecorder(); // Init recorder
            });
    });

    els.recordAnswerBtn.addEventListener('click', () => {
        els.recordAnswerBtn.classList.add('hidden');
        els.stopAnswerBtn.classList.remove('hidden');

        // Start STT
        if (state.interviewRecognition) {
            try { state.interviewRecognition.start(); } catch (e) { }
        }

        // Start WAV Recording
        if (state.wavRecorder) {
            state.wavRecorder.start().catch(err => alert("Mic Error: " + err));
        } else {
            state.wavRecorder = new WavRecorder();
            state.wavRecorder.start();
        }
    });

    els.stopAnswerBtn.addEventListener('click', () => {
        els.stopAnswerBtn.classList.add('hidden');
        els.recordAnswerBtn.classList.remove('hidden');
        els.liveSttText.textContent = "Processing answer...";

        if (state.interviewRecognition) state.interviewRecognition.stop();

        if (state.wavRecorder && state.wavRecorder.recording) {
            state.wavRecorder.stop().then(audioBlob => {
                submitAnswer(audioBlob);
            });
        }
    });

    function submitAnswer(blob) {
        addChatMessage('user', els.liveSttText.textContent || "(Audio Answer)");
        els.liveSttText.textContent = "AI is thinking...";

        const formData = new FormData();
        formData.append('audio_data', blob);

        fetch('/interview/process', { method: 'POST', body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Server Error " + res.status);
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.error);

                addChatMessage('assistant', data.llm_response);
                playAudio(data.audio_url);
                els.liveSttText.textContent = "Listening...";

                if (data.is_finished) {
                    processResults(data.final_report);
                }
            })
            .catch(err => {
                console.error(err);
                els.liveSttText.textContent = "Error: " + err.message;
                addChatMessage('system', "Error processing answer. Please try again.");
            });
    }

    function processResults(report) {
        setTimeout(() => {
            navigateTo('results');
            if (report) {
                els.finalScore.textContent = report.final_score;
                els.violationCount.textContent = Math.floor(state.proctorViolations / 10); // Rough estimate
                els.integrityStatus.textContent = (state.proctorViolations < 500) ? "High" : "Low";

                els.weaknessList.innerHTML = "";
                if (report.weak_points) {
                    report.weak_points.forEach(p => {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>Q: ${p.question}</strong><br>Feedback: ${p.evaluation.feedback}`;
                        els.weaknessList.appendChild(li);
                    });
                }
            }
        }, 5000);
    }

    /* =========================================
       UTILITIES
       ========================================= */
    function addChatMessage(role, text) {
        // Prevent dupes
        const div = document.createElement('div');
        div.className = `chat-bubble ${role}`;
        div.innerHTML = text; // Allow HTML for formatting
        els.chatHistory.appendChild(div);
        els.chatHistory.scrollTop = els.chatHistory.scrollHeight;
    }

    function playAudio(url) {
        if (url) {
            els.interviewerAudio.src = url + "?t=" + new Date().getTime();
            els.interviewerAudio.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }
});
