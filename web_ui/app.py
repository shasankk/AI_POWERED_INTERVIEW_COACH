from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import speech_recognition as sr
import os
import tempfile
import time
import uuid
from utils.cv_parser import extract_text_from_file, preprocess_text
from utils.skills_db import extract_skills_from_text
from utils.matcher import get_matcher
from utils.question_gen import generate_interview_questions
from utils.evaluator import get_evaluator
try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    print("WARNING: 'gTTS' (Google Text-to-Speech) not found. Audio response disabled.")
    print("Run 'pip install gTTS' to enable.")

# Try importing Whisper (Large dependency, might be missing)
try:
    import whisper
    import torch
    WHISPER_AVAILABLE = True
    print("Whisper module found.")
except ImportError:
    WHISPER_AVAILABLE = False
    print("WARNING: 'openai-whisper' not found. Using Google Speech Recognition as fallback.")
    print("To enable AI transcription, run: pip install openai-whisper")

app = Flask(__name__)
CORS(app)

# Check for FFmpeg (Required by Whisper)
import shutil
FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None

# Load Whisper Model
model = None
if WHISPER_AVAILABLE:
    if not FFMPEG_AVAILABLE:
        print("WARNING: 'ffmpeg' not found in PATH. Whisper requires FFmpeg.")
        print("Falling back to Google Speech Recognition for transcription.")
        WHISPER_AVAILABLE = False
    else:
        print("Loading Whisper model...")
        try:
            model = whisper.load_model("base")
            print("Whisper model loaded.")
        except Exception as e:
            print(f"Error loading Whisper: {e}")
            WHISPER_AVAILABLE = False

# Mock Interview History
interview_history = []

@app.route('/')
def home():
    return jsonify({"status": "API is running"})

@app.route('/login')
def login():
    return jsonify({"message": "Login successful"})

@app.route('/signup')
def signup():
    return jsonify({"message": "Signup successful"})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'audio_data' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['audio_data']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Save to a temporary file
        fd, path = tempfile.mkstemp(suffix=".wav")
        try:
            with os.fdopen(fd, 'wb') as tmp:
                file.save(tmp)
            
            # Use Whisper if available, else fallback
            if WHISPER_AVAILABLE and model:
                result = model.transcribe(path)
                text = result["text"]
                return jsonify({'transcript': text})
            else:
                # Process with SpeechRecognition (Google)
                recognizer = sr.Recognizer()
                with sr.AudioFile(path) as source:
                    audio_data = recognizer.record(source)
                    text = recognizer.recognize_google(audio_data)
                    return jsonify({'transcript': text})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            try:
                os.remove(path)
            except:
                pass


# structured interview state
INTERVIEW_QUESTIONS = [
    "Could you please introduce yourself and tell me about your background?",
    "Let's move to technical topics. What is the difference between a list and a tuple in Python?",
    "Can you explain what a decorator is and how you might use one?",
    "In the context of databases, can you explain the concept of ACID properties?",
    "Scenario: Your application is running slow. How would you debug and optimize it?",
    "That concludes the technical part. Do you have any questions for us?"
]

# Simple in-memory session (Global for single user demo)
# Simple in-memory session (Global for single user demo)
session_state = {
    "current_question_index": 0,
    "history": [],
    "questions": INTERVIEW_QUESTIONS, # Default to static
    "analysis_result": None
}

@app.route('/upload_analysis', methods=['POST'])
def upload_analysis():
    if 'cv_file' not in request.files or 'jd_file' not in request.files:
        return jsonify({'error': 'Please upload both CV and Job Description.'}), 400
        
    cv = request.files['cv_file']
    jd = request.files['jd_file']
    
    # Save temp
    try:
        cv_fd, cv_path = tempfile.mkstemp(suffix=os.path.splitext(cv.filename)[1])
        jd_fd, jd_path = tempfile.mkstemp(suffix=os.path.splitext(jd.filename)[1])
        
        with os.fdopen(cv_fd, 'wb') as f: cv.save(f)
        with os.fdopen(jd_fd, 'wb') as f: jd.save(f)
        
        # 1. Extraction
        raw_cv_text = extract_text_from_file(cv_path)
        raw_jd_text = extract_text_from_file(jd_path)
        
        # 2. Preprocess
        cv_text = preprocess_text(raw_cv_text)
        jd_text = preprocess_text(raw_jd_text)
        
        # 3. Match (SBERT)
        matcher = get_matcher()
        similarity_score = matcher.calculate_similarity(cv_text, jd_text)
        
        # 4. Skills
        cv_skills = extract_skills_from_text(raw_cv_text) # Use raw for better regex matching (c++, etc)
        jd_skills = extract_skills_from_text(raw_jd_text)
        
        matched_skills = cv_skills.intersection(jd_skills)
        missing_skills = jd_skills - cv_skills
        
        # 5. Question Gen
        dynamic_questions = generate_interview_questions(matched_skills, missing_skills)
        
        # Add Intro and Outro
        final_questions = [
            f"Welcome. I have reviewed your CV. We found a {int(similarity_score*100)}% match with the Job Description. Let's start with a quick introduction."
        ] + dynamic_questions + [
            "That concludes our technical questions. Do you have any final questions for us?"
        ]
        
        # Update State
        session_state["questions"] = final_questions
        session_state["analysis_result"] = {
            "score": int(similarity_score * 100),
            "matched_skills": list(matched_skills),
            "missing_skills": list(missing_skills)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            if os.path.exists(cv_path): os.remove(cv_path)
            if os.path.exists(jd_path): os.remove(jd_path)
        except: pass

    return jsonify({
        "status": "success",
        "score": session_state["analysis_result"]["score"],
        "message": "Analysis ready. Starting interview."
    })

@app.route('/interview/reset', methods=['POST'])
def reset_interview():
    session_state["current_question_index"] = 0
    session_state["history"] = []
    
    active_questions = session_state.get("questions", INTERVIEW_QUESTIONS)
    
    # Generate audio for the first question
    # Fix: First question formatting check
    first_q_text = active_questions[0]
    if "Welcome" not in first_q_text: # Standard Intro
        first_q = f"Hello. Welcome to the interview. {first_q_text}"
    else:
        first_q = first_q_text # Already has intro from dynamic gen
    
    audio_url = generate_tts(first_q)
    
    return jsonify({
        "message": "Interview started",
        "question": first_q,
        "audio_url": audio_url
    })

def generate_tts(text):
    if not GTTS_AVAILABLE:
        return None
        
    try:
        tts_filename = f"q_{uuid.uuid4().hex}.mp3"
        cache_dir = os.path.join(app.root_path, "static", "audio_cache")
        os.makedirs(cache_dir, exist_ok=True)
        full_path = os.path.join(cache_dir, tts_filename)
        
        tts = gTTS(text=text, lang='en')
        tts.save(full_path)
        return f"/static/audio_cache/{tts_filename}"
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

@app.route('/interview/process', methods=['POST'])
def process_interview():
    if 'audio_data' not in request.files:
        return jsonify({'error': 'No audio data'}), 400
    
    file = request.files['audio_data']
    
    # 1. Save and Transcribe
    fd, path = tempfile.mkstemp(suffix=".wav")
    try:
        with os.fdopen(fd, 'wb') as tmp:
            file.save(tmp)
        
        # Transcribe
        if not (WHISPER_AVAILABLE and model):
            # Fallback
            try:
                recognizer = sr.Recognizer()
                with sr.AudioFile(path) as source:
                    audio_data = recognizer.record(source)
                    user_text = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                user_text = "..."
            except Exception as e:
                return jsonify({'error': f"Speech Error: {str(e)}"}), 500
        else:
            transcription_result = model.transcribe(path)
            user_text = transcription_result["text"]
        
        current_idx = session_state["current_question_index"]
        active_questions = session_state.get("questions", INTERVIEW_QUESTIONS)
        current_question_text = active_questions[current_idx] if current_idx < len(active_questions) else ""
        
        # Evaluate Answer
        evaluator = get_evaluator()
        eval_result = evaluator.evaluate_answer(current_question_text, user_text)
        
        # Save user answer with evaluation
        session_state["history"].append({
            "role": "user",
            "content": user_text,
            "question_idx": current_idx,
            "question": current_question_text,
            "evaluation": eval_result
        })
        
        # Determine next move
        response_text = ""
        next_idx = current_idx + 1
        
        final_report = None
        
        if next_idx < len(active_questions):
            # Acknowledge and ask next
            # Simple "LLM" acknowledgement buffer
            acknowledgements = ["Thank you.", "Good.", "I see.", "Okay.", "Interesting."]
            import random
            ack = random.choice(acknowledgements)
            
            next_q = active_questions[next_idx]
            response_text = f"{ack} {next_q}"
            session_state["current_question_index"] = next_idx
        else:
            response_text = "Thank you for answering all the questions. We have generated your performance report."
            
            # Generate Final Report
            cv_score = 0
            if session_state.get("analysis_result"):
                cv_score = session_state["analysis_result"].get("score", 0)
                
            final_report = evaluator.generate_final_report(session_state["history"], cv_score)
            
        # 3. TTS
        audio_url = None
        if response_text:
            try:
                audio_url = generate_tts(response_text)
            except Exception as e:
                print(f"TTS Generation Failed (Non-fatal): {e}")

        return jsonify({
            'user_transcript': user_text,
            'llm_response': response_text,
            'audio_url': audio_url,
            'is_finished': next_idx >= len(active_questions),
            'final_report': final_report
        })
        
    except Exception as e:
        import traceback
        print("Error in interview loop:")
        traceback.print_exc()
        # Return 200 OK but with error field so frontend handles it gracefully without crashing
        return jsonify({
            'user_transcript': "(Error processing audio)",
            'llm_response': "I'm sorry, I couldn't hear that clearly. Could you please repeat?",
            'audio_url': None,
            'is_finished': False,
            'error': str(e) 
        }), 200
    finally:
        try:
            os.remove(path)
        except:
            pass

if __name__ == '__main__':
    # Ensure static/audio_cache exists
    # app.root_path requires app context or manual path
    # We do it inside route usually, but for startup:
    try:
        os.makedirs(os.path.join(os.getcwd(), 'static', 'audio_cache'), exist_ok=True)
    except:
        pass
        
    import webbrowser
    webbrowser.open('http://127.0.0.1:5000')
    app.run(debug=True)
