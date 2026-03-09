# AI Mock Interviewer - Presentation Script

**Slide 1: Title Slide**
Good morning/afternoon everyone. Today, I am presenting our project: the **AI Mock Interviewer**. This is an intelligent system designed to automate the technical interview process using modern Artificial Intelligence.

**Slide 2: Project Overview & Problem Statement**
Let's start with the problem. Job seekers often struggle with technical interviews due to anxiety and a lack of practice. Traditional mock interviews are expensive or hard to schedule.
**Our Solution** is a web-based platform where an AI interviewer conducts a real-time voice interview. It screens the candidate's resume, asks dynamic technical questions, monitors their focus, and provides instant, objective feedback.

**Slide 3: System Architecture**
The system is built on a Client-Server architecture.
*   **The Frontend (Client)**: Is a responsive web application that handles the user's Camera and Microphone.
*   **The Backend (Server)**: Is powered by Python and Flask. This is where the heavy lifting happens—resume parsing, AI logic, and scoring.
*   **The Intelligence Layer**: We use Google's **Gemini 2.0 Flash** model as the "Brain" of the interviewer, and **Sentence-BERT** for semantic resume matching.

**Slide 4: Technical Stack**
We chose a modern and robust stack for this application:
*   **Frontend**: HTML5, CSS3, and Vanilla JavaScript. We avoided heavy frameworks to keep the application lightweight and fast.
*   **Computer Vision**: We use **TensorFlow.js** with the **BlazeFace** model running directly in the browser to track eye movements for proctoring.
*   **Backend**: Python with **Flask**.
*   **AI Models**:
    *   **Gemini 2.0 Flash**: For generating questions and grading answers.
    *   **SBERT**: For matching Resumes to Job Descriptions.
    *   **Whisper/Google Speech**: For converting speech to text.
    *   **gTTS**: For converting text to speech.

**Slide 5: Methodology - Step 1: Profile Validation**
The process starts with **Profile Validation**. The user uploads a Resume and a Job Description. Our system uses the **SBERT** model to convert both documents into mathematical vectors. We then calculate the **Cosine Similarity** score. If the match is high enough (e.g., >50%), the candidate proceeds; otherwise, they are advised to improve their resume.

**Slide 6: Methodology - Step 2: Auto-Flow Interaction**
Once the interview starts, we enter an **Automated Loop**:
1.  The AI analyzes the candidate's skills and generates a unique technical question using **Gemini**.
2.  The question is converted to audio and played to the user.
3.   The user records their answer securely.
4.  The answer is transcribed to text and sent back to the AI for grading.
This cycle repeats for 5 questions, simulating a real conversation.

**Slide 7: Methodology - Step 3: Real-Time Proctoring**
Integrity is crucial. We implemented a **Real-Time Proctoring** system using **BlazeFace**.
measures the geometry of the user's face 60 times a second.
*   If the user looks **Left or Right** (potential cheating), or **Up/Down** (loss of focus), the system triggers a warning.
*   Multiple faces detection is also enabled to ensure no external help.

**Slide 8: Methodology - Step 4: Performance Evaluation**
Finally, we generate a comprehensive **Performance Report**.
*   **Technical Score**: The AI grades every answer on a scale of 0-10 based on depth and correctness.
*   **Resume Fit**: The initial match percentage.
*   **Focus Score**: Based on the number of proctoring alerts.
This allows the candidate to see exactly where they need to improve—whether it's their technical knowledge or their interview presence.

**Slide 9: Conclusion**
In conclusion, the AI Mock Interviewer is a complete, end-to-end solution. It automates screening, conducts intelligent interviews, ensures integrity, and provides actionable feedback. It bridges the gap between preparation and performance.
Thank you. I am happy to take any questions.
