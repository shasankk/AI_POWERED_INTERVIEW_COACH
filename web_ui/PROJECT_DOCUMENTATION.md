# AI Mock Interviewer - Comprehensive Project Documentation

## 1. Project Overview
**AI Mock Interviewer** is a web-based application designed to simulate a real-world technical interview. It uses Artificial Intelligence to:
1.  **Analyze** a candidate's Resume (CV) against a Job Description (JD).
2.  **Conduct** a voice-based interview with dynamic questions.
3.  **Monitor** the candidate for integrity (Proctoring) using the camera.
4.  **Evaluate** answers and provide a performance report.

The system acts as a bridge between a user (Candidate) and an AI Logic System (Interviewer) using a **Client-Server Architecture**.

---

## 2. Technology Stack & Definitions

### A. The Backend: Flask (Python)
**What is it?**
Flask is a **micro-web framework** written in Python. It provides the essential tools to build a web server (handling URLs, requests, and responses) without imposing a rigid structure.

**Why Flask?**
*   **Python Integration**: AI and Data Science libraries (like TensorFlow, PyTorch, NLTK) are native to Python. Flask allows us to seamlessly run these heavy AI models on the server.
*   **Simplicity**: It doesn't require complex configuration like Django. Ideally suited for prototypes and single-purpose apps like this.
*   **API Capabilities**: Flask makes it very easy to create **RESTful API endpoints** (URLs that return data instead of pages), which is how our frontend talks to the backend.

### B. The Frontend: HTML, CSS, JavaScript
*   **HTML (HyperText Markup Language)**: The skeleton of the page (buttons, video boxes, chat bubbles).
*   **CSS (Cascading Style Sheets)**: The skin of the page. We used **Vanilla CSS** (no large frameworks like Bootstrap) to create a custom, high-performance "Glassmorphism" design (translucent, modern look).
*   **JavaScript (Vanilla)**: The muscles. It runs in your browser to:
    *   Capture your microphone and camera.
    *   Send your audio to the server.
    *   Update the chat interface without reloading the page.
    *   Run the Face Detection model.

---

## 3. Deep Dive: AI Models & Libraries

We use several specialized AI components. Here is exactly what they are and why we use them:

### 1. Text-to-Speech (TTS)
*   **Library**: `gTTS` (Google Text-to-Speech).
*   **What it does**: Converts string text (e.g., "Tell me about Python") into an MP3 audio file.
*   **Where is it used?**: In `app.py`. Every time the AI generates a text response, we send that text to Google's servers. Google sends back audio, which we save as a temporary file and play in the browser.
*   **Why?**: It offers natural-sounding English voices for free/low cost compared to training a custom voice model.

### 2. Speech-to-Text (STT)
*   **Library**: `SpeechRecognition` (Google API) and `OpenAI Whisper` (Local/Cloud).
*   **What it does**: The reverse of TTS. It takes your recorded `.wav` audio and converts it into text.
*   **Workflow**:
    *   If you have a powerful computer with GPU: We try to use **Whisper** (locally running AI model by OpenAI) for high accuracy.
    *   Fallback: We use **Google Speech Recognition** (sends audio to Google) if Whisper isn't setup. This ensures the app works on any machine.

### 3. Semantic Analysis (The "Brain")
*   **Library**: `sentence-transformers` (SBERT).
*   **Model Name**: `all-MiniLM-L6-v2`.
*   **Definition**: This is a **Language Model**. Unlike simple keyword matching, it turns sentences into "Vectors" (lists of numbers).
*   **Why?**:
    *   If the job needs "Python" and you write "Django" (a Python framework), keyword search might miss it.
    *   **Vectors** understand that "Python" and "Django" are conceptually close. We use this to calculate the **Verification Score** (CV vs JD match) and to evaluate if your answer is relevant to the question.

### 4. Computer Vision (Proctoring)
*   **Library**: `TensorFlow.js` + `BlazeFace`.
*   **Where it runs**: **In the Browser (Frontend)**. This is crucial for speed. We don't send video to the server (too slow).
*   **What it does**: It detects facial landmarks (eyes, nose, ears) 60 times a second.
*   **Logic**:
    *   **Looking Left/Right**: Calculates distance from nose to ears.
    *   **Looking Up/Down**: Calculates distance from nose to eye-level.

---

## 4. Codebase Structure & "Module-by-Module" Explanation

Here is the anatomy of your project `D:\speechtext-video-interview\speechtext-video-interview\web_ui`:

### A. `app.py` (The Controller)
This is the heart of the backend.
*   **Routes (`@app.route`)**: Defines URLs like `/upload_analysis` and `/interview/process`.
*   **Audio Handling**: Integrates the TTS and STT logic.
*   **Session State**: Keeps track of "Current Question", "History", and "Scores" in memory.

### B. `static/script.js` (The Client Logic)
This manages the user experience.
*   **`WavRecorder` Class**: A custom recorder we built. Browsers normally record in `WebM` format, but Python prefers `WAV`. This script manually captures raw audio bytes and headers to make a perfect WAV file.
*   **`detectFaces()`**: The infinite loop that watches your face and updates the "Secure/Alert" badge.
*   **`submitAnswer()`**: Bundles your audio and sends it to `app.py`.

### C. `utils/cv_parser.py`
*   **Purpose**: To read PDF and DOCX files.
*   **Libraries**: `pdfminer.six` (PDFs) and `docx2txt` (Word docs). It strips away formatting and just gives us the raw text.

### D. `utils/matcher.py`
*   **Purpose**: The "Judge".
*   **Function**: `calculate_similarity(text1, text2)`.
*   **How**: It loads the SBERT model, converts both texts to vectors, and calculates the "Cosine Similarity" (a math formula that tells us how parallel two vectors are). 1.0 means identical, 0.0 means unrelated.

### E. `utils/question_gen.py`
*   **Purpose**: The "Interviewer".
*   **Logic**: It doesn't just pick random questions. It follows a rule:
    1.  **Strict**: Must ask 2 OOP questions and 1 DBMS question (Hardcoded).
    2.  **Dynamic**: Finds a skill you have (e.g., "React") and inserts it into a template ("How do you use React?").
    3.  **Behavioral**: Fills any gaps with soft-skill questions.

### F. `utils/evaluator.py`
*   **Purpose**: The "Grader".
*   **Logic**: It takes your answer and the original question.
    *   Checks length (did you say enough?).
    *   Checks consistency (is your answer semantically related to the question?).
    *   Checks keywords (did you mention technical terms?).
    *   Returns a score (0-10) and feedback string.

---

## 5. The Complete Workflow (Step-by-Step)

1.  **Initialization**:
    *   You run `python app.py`. Flask starts listening on port 5000.
    *   Browser request `http://localhost:5000`. Flask sends `index.html`.

2.  **Step 1: Setup**:
    *   You upload CV and JD.
    *   JS sends them to `/upload_analysis`.
    *   Backend extracts text -> SBERT compares them -> Returns a Match Score (e.g., 85%).

3.  **Step 2: The Interview (The Loop)**:
    *   **Start**: Backend picks Question 1.
    *   **TTS**: Backend generates `q_1.mp3` via Google TTS. Returns URL to Frontend.
    *   **Frontend**: Plays audio.
    *   **User Action**: Clicks "Record", speaks, clicks "Stop".
    *   **STT**: Frontend sends `audio.wav` to `/interview/process`. Backend converts speech to text ("I know Python...").
    *   **Evaluation**: `evaluator.py` grades the text.
    *   **Next Question**: Backend picks Question 2.
    *   **Repeat**: This loop continues until 5 questions are done.

4.  **Step 3: Results**:
    *   Frontend receives the `final_report` JSON.
    *   It hides the Interview View and shows the Report Dashboard.
    *   It displays the Integrity Score (from the Proctoring loop) and the Technical Score (from SBERT).

---

## 6. Why did we do it this way?
*   **Why not full JavaScript?** Browsers can't run heavy logic like Resume Parsing or accurate Grammar Evaluation easily. We needed Python's power.
*   **Why not full Python?** Python (Tkinter) UIs look old. HTML/CSS allows for beautiful, modern, responsive designs.
*   **Why SBERT?** It is the industry standard for "Semantic Search". It's much smarter than "Ctrl+F" keyword matching.

This architecture is scalable. If you wanted to add "Eye Tracking" or "Emotion Analysis" later, you would just add a new Python module and hook it into `app.py`.
