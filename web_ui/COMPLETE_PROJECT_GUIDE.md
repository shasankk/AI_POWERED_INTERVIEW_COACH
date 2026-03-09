# AI Mock Interviewer - The Complete Technical Guide
*Perfect for Presentation & detailed understanding*

---

## 1. Project Introduction
**System Name:** AI Mock Interviewer  
**Goal:** To simulate a real-world technical interview environment using Artificial Intelligence. The system evaluates a candidate's resume, asks relevant technical questions via voice, monitors their behavior (proctoring), and grades their answers automatically.

### Why did we build this?
*   **Automation:** Reduces the burden on HR teams for initial screening.
*   **Objectivity:** AI provides consistent scoring based on semantic meaning, not just keywords.
*   **Access:** Candidates can practice anytime, anywhere.

---

## 2. High-Level Architecture (The Big Picture)
The application follows a **Client-Server Architecture**.

*   **The Client (Frontend):** The web browser (Chrome/Edge). It handles what the user *sees* and *does* (Camera, Microphone, Buttons).
*   **The Server (Backend):** The Python program running on the computer. It handles the *integelligence* (Analysis, Grading, Audio generation).

They communicate via **HTTP Requests** (API calls). The Frontend sends data (like an audio file), and the Backend sends back a response (like text feedback).

---

## 3. The Frontend (User Interface)
**Location:** the `templates/` and `static/` folders.

### Technologies Used:
1.  **HTML5 (Structure):** Defines the layout (Sidebar, Video Box, Chat Window).
2.  **CSS3 (Styling):**
    *   **Design Style:** Glassmorphism (Modern, translucent visuals).
    *   **Layout:** Flexbox & Grid for responsive design.
    *   **Why Vanilla CSS?** We avoided heavy frameworks (like Bootstrap) to keep the code lightweight and have full control over the specific "Live Interview" layout.
3.  **JavaScript (Logic):**
    *   **Media Capture:** Uses the browser's `navigator.mediaDevices` API to access the Webcam and Microphone.
    *   **Connectivity:** Uses `fetch()` API to talk to the Python backend.

### Key Frontend Libraries:
*   **TensorFlow.js + BlazeFace:**
    *   **What is it?** A lightweight AI model that runs *inside the browser*.
    *   **Usage (Proctoring):** It detects the user's face 60 times a second.
    *   **Logic:** It calculates the distance between nose, eyes, and ears to determine if the user is looking away (Cheating Detection).
    *   **Why Frontend?** Running video analysis on the server is too slow (latency). Doing it in the browser is real-time.

---

## 4. The Backend (The Brain)
**Location:** `app.py` and `utils/` folder.

### Core Technology: Flask (Python)
*   **What is Flask?** Flask is a "micro" web framework for Python.
*   **Why did we use it?**
    *   **Python Native:** Our AI libraries (SBERT, Whisper) are Python-based. Flask allows us to run them directly.
    *   **Lightweight:** It provides just the essentials (Routing making URLs work) without the bloat of larger frameworks like Django.
    *   **API Support:** It makes creating endpoints (like `/upload` or `/process`) extremely simple.

### Backend Workflow Modules:

#### A. Resume Parsing Module (`utils/cv_parser.py`)
*   **Goal:** Read the User's CV (PDF or DOCX).
*   **Libraries:**
    *   `pdfminer.six`: Extracts text from PDF files.
    *   `docx2txt`: Extracts text from Word documents.
*   **Process:** User uploads file -> Python reads binary data -> Converts to plain text string -> Cleans special characters.

#### B. Semantic Matching Module (`utils/matcher.py`)
*   **Goal:** Compare the Resume text with the Job Description (JD).
*   **The Model:** **SBERT (Sentence-BERT)**.
    *   **Specific Model:** `all-MiniLM-L6-v2`.
*   **How it works (The Magic):**
    *   It does **not** count matching words.
    *   It converts the Resume and JD into **Vectors** (lists of numbers representing meaning).
    *   It calculates **Cosine Similarity** (a math score from 0 to 1). If the vectors point in the same direction, the meaning is similar.
*   **Result:** A percentage match score (e.g., 85%).

#### C. Audio Intelligence (STT & TTS)
This is where the voice interaction happens.

**1. Speech-to-Text (STT) - The "Ears"**
*   **Goal:** Converting user's spoken audio `.wav` -> Text.
*   **Primary Logic:** We check if **OpenAI Whisper** (a powerful offline AI model) is installed.
    *   If yes: Use Whisper (High accuracy).
    *   If no: Fallback to **Google Speech Recognition** API (Requires internet, uses `SpeechRecognition` library).

**2. Text-to-Speech (TTS) - The "Mouth"**
*   **Goal:** Converting AI's text Question -> Audio `.mp3`.
*   **Library:** **gTTS (Google Text-to-Speech)**.
*   **Where is it used?** In `app.py` -> `generate_tts(text)`.
*   **Process:**
    1.  AI decides the question text: "What is Polymorphism?"
    2.  Backend calls `gTTS("What is Polymorphism?", lang='en')`.
    3.  Google returns audio data.
    4.  Backend saves it as `q_<random_id>.mp3` in the `static/audio_cache/` folder.
    5.  Backend sends the file URL to the frontend to play it.

#### D. Question Generator (`utils/question_gen.py`)
*   **Goal:** Decide what to ask the candidate.
*   **Strategy:** Structured + Dynamic.
    *   **Fixed:** It *must* ask 2 OOP questions and 1 DBMS question (Hardcoded for consistency).
    *   **Dynamic:** It looks at the "Matched Skills" from the resume (e.g., "Python") and inserts them into templates (e.g., "How do you use Python?").
    *   **Behavioral:** Fills the remaining time with soft-skill questions.

#### E. Answer Evaluator (`utils/evaluator.py`)
*   **Goal:** Grade the answer.
*   **Logic:**
    1.  **Similarity Check:** Uses SBERT to see if the User's Answer vector is close to the Question vector.
    2.  **Keyword Check:** Did the user mention specific technical terms related to the question?
    3.  **Length Check:** Is the answer too short to be meaningful?
*   **Output:** A score (0-10) and feedback (e.g., "Good depth" or "Too vague").

---

## 5. The Complete Data Flow (Step-by-Step)

1.  **Start:** User opens `http://127.0.0.1:5000`.
2.  **Setup:**
    *   User uploads CV + JD.
    *   **Backend** parses them, calculates Match Score (SBERT).
3.  **Interview Begin:**
    *   **Backend** picks Q1 ("Tell me about yourself").
    *   **Backend** generates Audio (gTTS).
    *   **Frontend** plays Audio.
4.  **User Answer:**
    *   **Frontend** records Microphone (WavRecorder).
    *   **Frontend** detects Face (BlazeFace) -> Shows alert if looking away.
    *   User clicks "Stop" -> Audio sent to Backend.
5.  **Processing:**
    *   **Backend** converts Audio to Text (Whisper/Google).
    *   **Backend** grades the text (Evaluator).
    *   **Backend** picks Q2.
6.  **Loop:** Steps 3-5 repeat for 5 questions.
7.  **Finish:**
    *   **Backend** compiles a Final JSON Report.
    *   **Frontend** displays the Report Dashboard.

---

## 6. Definitions for the Presentation

*   **API (Application Programming Interface):** The messenger that takes requests (Frontend) and tells the system (Backend) what to do.
*   **Embeddings/Vectors:** Converting text into numbers so a computer can understand "Meaning" rather than just spelling.
*   **Flask:** The minimalist Python tool that lets us turn our Python scripts into a website.
*   **Latency:** The delay between you speaking and the AI responding. We optimized this by keeping processing local where possible.
*   **Proctoring:** Using AI to ensure the candidate isn't cheating (looking at notes/phone).
