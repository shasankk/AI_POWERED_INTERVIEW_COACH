# AI Mock Interviewer - Project Presentation

## Slide 1: Project Overview

### Problem Statement
Job seekers often struggle with interview performance due to anxiety, lack of technical preparedness, and unstructured answers. Traditional mock interviews are either unavailable or expensive. Candidates need a way to practice in a realistic, low-pressure environment before facing actual recruiters.

### Solution
An intelligent **AI-Mock Interviewer** system that conducts a full technical interview. It evaluates the candidate's Resume relevance, assesses their spoken technical answers using Generative AI, monitors their focus (Proctoring), and provides instant, objective feedback to help them improve.

---

## Slide 2: Key Objectives & System Architecture

### Key Objectives
*   **Automated Screening**: Instantly match Candidate Resume against Job Description.
*   **AI-Driven Interview**: Conduct a voice-based technical interview with dynamic questions tailored to the candidate's profile.
*   **Integrity Monitoring**: Real-time proctoring to detect if the candidate is looking away or distracted.
*   **Comprehensive Feedback**: detailed scoring on technical accuracy, relevance, and soft skills.

### System Architecture
*   **Input Layer**: Accepts PDF/DOCX Resumes and Job Descriptions for parsing.
*   **Interaction Layer**: A modern Web Interface where the AI speaks questions and the user responds via microphone and camera.
*   **Processing Layer**:
    1.  **Audio**: Speech converted to text (STT) and analyzed for semantic correctness.
    2.  **Video**: Browser-based computer vision tracks face landmarks for focus.
    3.  **Intelligence**: LLM (Gemini) generates context-aware questions and grades answers.
*   **Output Layer**: A final Performance Dashboard displaying Technical Score, Resume Match %, and Audio Confidence.

---

## Slide 3: The Technical Stack

### Frontend
*   **HTML5/CSS3**: Custom "Glassmorphism" UI for a modern, responsive feel.
*   **JavaScript (Vanilla)**: Handles media capture (Camera/Mic) and API communication.
*   **BlazeFace (TensorFlow.js)**: Runs lightweight face detection directly in the browser for real-time proctoring.

### Backend
*   **Flask (Python)**: The core web server handling routing and API logic.
*   **Google Gemini 1.5 Flash**: The "Brain" for generating dynamic questions and evaluating answers like a human.
*   **Sentence-Transformers (SBERT)**: For semantic similarity matching between Resume and JD.

### Speech Services
*   **Google Speech Recognition / Whisper**: Converts user speech to text.
*   **gTTS (Google Text-to-Speech)**: Converts AI text questions into natural-sounding audio.

---

## Slide 4: Methodology

### 1. Profile Validation
Before the interview begins, the system extracts text from the uploaded Resume and Job Description. It uses **Cosine Similarity** on SBERT embeddings to calculate a "Match Score". This ensures the candidate is relevant for the role before proceeding.

### 2. Auto-Flow Interaction
We implemented a seamless automated loop:
1.  AI generates a context-aware question based on the Resume.
2.  TTS speaks the question.
3.  User records answer.
4.  STT transcribes answer.
5.  System moves to the next question automatically.

### 3. Real-Time Proctoring
During the session, the **BlazeFace** model tracks 68 facial landmarks. It calculates the geometry of the nose, eyes, and ears to detect:
*   **Looking Left/Right**: Potential cheating/reading notes.
*   **Looking Up/Down**: Distraction or lack of focus.
*   **Multiple Faces**: Unauthorized presence.

### 4. Performance Evaluation
Final feedback is comprehensive. It aggregates:
*   **Technical Accuracy**: Graded by Gemini AI (0-10 scale).
*   **Resume Fit**: The initial Match Score.
*   **Behavioral Integrity**: Based on the number of proctoring alerts triggered.

---

## Slide 5: Implementation Details

### Resume Scoring
Integrated **PDFMiner** and **Docx2txt** to extract raw text from resumes. SBERT connects this unstructured text to the Job Description to find the "Semantic Distance" between them.

### Focus Monitoring
Implemented a "Focused vs. Suspicious" status using **MediaPipe/BlazeFace** mesh tracking. If the user looks away for more than 2 seconds, a visual alert triggers, and the incident is logged.

### Dynamic Question Generation
Unlike static question banks, our system uses **Generative AI (Gemini)** to read the candidate's specific skills (e.g., "React", "Python") and ask tailored, deep-dive questions (e.g., "Explain how React Hooks handle state").

### Dashboard Visualization
Created a data-driven Results Dashboard that displays:
*   **Final Score**: Weighted average of Interview & Resume.
*   **Weak Areas**: Specific topics where the candidate's answer was rated low.
*   **Pass/Fail Status**: Automatic determination based on a 60% threshold.
