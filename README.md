# VoiceSync - Speech & Text Interface

Beautiful web interface for Text-to-Speech (TTS), Speech-to-Text (STT), and **Mock Interview** tasks.

## 🚀 How to Run

### Option 1: The Easy Way (Windows)
Simply double-click the **`run_app.bat`** file in this folder.
This will automatically:
1. **Install dependencies** (including Whisper and PyTorch - this may take a few minutes the first time).
2. Start the server.
3. Open your default web browser to the application.

### Option 2: Manual Start (Terminal)
**IMPORTANT:** You must configure your environment and use the virtual environment where dependencies are installed.

1. **Set Up Environment Variables**:
   In the `web_ui` folder, copy `.env.example` to a new file named `.env`, and fill in your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   GROQ_API_KEY=your_groq_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   ```

2. **Activate Virtual Environment**:
   ```bash
   .\venv\Scripts\activate
   ```

3. **Run the App**:
   Navigate to the `web_ui` folder and run the Python script:
   ```bash
   cd web_ui
   python app.py
   ```

4. **Open Browser**:
   Go to `http://127.0.0.1:5000/static/index.html` or the location provided in your terminal in your web browser.

## ✨ Features
- **Mock Interview Loop**: Real-time conversational interview with AI (Whisper STT + Mock LLM + gTTS).
- **Candidate Monitoring**: AI-powered gaze detection (BlazeFace).
- **Text-to-Speech**: Type text and hear it spoken.
- **Speech-to-Text**: Real-time voice transcription.
- **Modern UI**: Dark mode with glassmorphism design.

## ⚠️ Troubleshooting
**Error: `ModuleNotFoundError: No module named 'whisper'`**
- This happens if you run `python app.py` without activating the virtual environment.
- **Fix:** Use `run_app.bat` or run `.\venv\Scripts\activate` before running python.
- **Note:** The first run installs PyTorch (~2GB), so it might take 5-10 minutes depending on your internet.

