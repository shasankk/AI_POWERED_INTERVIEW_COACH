// Helper to record 16-bit PCM WAV which is required by Python's wave/speech_recognition modules
// Standard MediaRecorder often outputs WebM which can fail without ffmpeg

export class WavRecorder {
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
