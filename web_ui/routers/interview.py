from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
import tempfile
import os
from pydantic import BaseModel
from typing import List

import auth
import models
import database
import schemas
from sqlalchemy.orm import Session

# Import existing ML utilities
from utils.cv_parser import extract_text_from_file, preprocess_text
from utils.skills_db import extract_skills_from_text
from utils.matcher import get_matcher
from utils.question_gen import generate_interview_questions

router = APIRouter(prefix="/interview", tags=["Interview"])

class AnalysisResponse(BaseModel):
    status: str
    score: int
    message: str
    session_id: int

@router.post("/setup")
async def upload_analysis(
    cv_file: UploadFile = File(...),
    jd_file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        cv_fd, cv_path = tempfile.mkstemp(suffix=".pdf") # defaulting extensions 
        jd_fd, jd_path = tempfile.mkstemp(suffix=".pdf")
        
        with os.fdopen(cv_fd, 'wb') as f: f.write(await cv_file.read())
        with os.fdopen(jd_fd, 'wb') as f: f.write(await jd_file.read())
        
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
        cv_skills = extract_skills_from_text(raw_cv_text)
        jd_skills = extract_skills_from_text(raw_jd_text)
        
        matched_skills = cv_skills.intersection(jd_skills)
        missing_skills = jd_skills - cv_skills
        
        # Create DB session entry
        new_interview = models.InterviewSession(
            user_id=current_user.id,
            cv_text=cv_text,
            jd_text=jd_text,
            match_score=int(similarity_score * 100),
            status="in_progress"
        )
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        
        # NOTE: State management like questions needs to be saved to DB or Redis. 
        # For now, we will save to the DB report_json (temporary cache).
        import json
        
        dynamic_questions = generate_interview_questions(matched_skills, missing_skills)
        final_questions = [
            f"Welcome. I have reviewed your CV. We found a {new_interview.match_score}% match with the Job Description. Let's start with a quick introduction."
        ] + dynamic_questions + [
            "That concludes our technical questions. Do you have any final questions for us?"
        ]
        
        state_data = {
            "questions": final_questions,
            "current_question_index": 0,
            "history": []
        }
        
        new_interview.report_json = json.dumps(state_data)
        db.commit()

        return AnalysisResponse(
            status="success",
            score=new_interview.match_score,
            message="Analysis ready. Starting interview.",
            session_id=new_interview.id
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if os.path.exists(cv_path): os.remove(cv_path)
            if os.path.exists(jd_path): os.remove(jd_path)
        except: pass

import uuid
import json
import os
from utils.evaluator import get_evaluator
from groq import Groq

# Re-init Groq for STT
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

def generate_tts(text: str) -> str:
    if not GTTS_AVAILABLE:
        return None
    try:
        tts_filename = f"q_{uuid.uuid4().hex}.mp3"
        cache_dir = os.path.join(os.getcwd(), "static", "audio_cache")
        os.makedirs(cache_dir, exist_ok=True)
        full_path = os.path.join(cache_dir, tts_filename)
        
        tts = gTTS(text=text, lang='en')
        tts.save(full_path)
        return f"/static/audio_cache/{tts_filename}"
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

class ResetResponse(BaseModel):
    message: str
    question: str
    audio_url: str | None

@router.post("/reset", response_model=ResetResponse)
async def reset_interview(
    session_id: int, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    interview = db.query(models.InterviewSession).filter(
        models.InterviewSession.id == session_id,
        models.InterviewSession.user_id == current_user.id
    ).first()
    
    if not interview or not interview.report_json:
        raise HTTPException(status_code=404, detail="Session not found or not initialized")
        
    state_data = json.loads(interview.report_json)
    state_data["current_question_index"] = 0
    state_data["history"] = []
    
    first_q_text = state_data["questions"][0]
    if "Welcome" not in first_q_text:
        first_q = f"Hello. Welcome to the interview. {first_q_text}"
    else:
        first_q = first_q_text
        
    audio_url = generate_tts(first_q)
    
    interview.report_json = json.dumps(state_data)
    db.commit()
    
    return ResetResponse(
        message="Interview started",
        question=first_q,
        audio_url=audio_url
    )

@router.post("/process")
async def process_interview(
    session_id: int,
    audio_data: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    interview = db.query(models.InterviewSession).filter(
        models.InterviewSession.id == session_id,
        models.InterviewSession.user_id == current_user.id
    ).first()
    
    if not interview or not interview.report_json:
        raise HTTPException(status_code=404, detail="Session not found")
        
    state_data = json.loads(interview.report_json)
    
    fd, path = tempfile.mkstemp(suffix=".wav")
    try:
        with os.fdopen(fd, 'wb') as tmp:
            tmp.write(await audio_data.read())
            
        try:
            with open(path, "rb") as file:
                transcription = groq_client.audio.transcriptions.create(
                    file=(path, file.read()),
                    model="whisper-large-v3",
                    temperature=0,
                    response_format="verbose_json",
                )
                user_text = transcription.text
        except Exception as e:
            print(f"Groq Whisper STT Error: {e}")
            user_text = "..."
            
        current_idx = state_data["current_question_index"]
        active_questions = state_data["questions"]
        current_question_text = active_questions[current_idx] if current_idx < len(active_questions) else ""
        
        from utils.prosody import analyze_prosody
        prosody_stats = analyze_prosody(path, user_text)
        
        evaluator = get_evaluator()
        eval_result = evaluator.evaluate_answer(current_question_text, user_text)
        
        state_data["history"].append({
            "role": "user",
            "content": user_text,
            "question_idx": current_idx,
            "question": current_question_text,
            "evaluation": eval_result,
            "prosody": prosody_stats
        })
        
        response_text = ""
        next_idx = current_idx + 1
        final_report = None
        is_finished = next_idx >= len(active_questions)
        
        if not is_finished:
            import random
            ack = random.choice(["Thank you.", "Good.", "I see.", "Okay.", "Interesting."])
            next_q = active_questions[next_idx]
            response_text = f"{ack} {next_q}"
            state_data["current_question_index"] = next_idx
        else:
            response_text = "Thank you for answering all the questions. We have generated your performance report."
            final_report = evaluator.generate_final_report(state_data["history"], interview.match_score or 0)
            interview.status = "completed"
            
        # Update DB state
        interview.report_json = json.dumps(state_data)
        db.commit()
        
        audio_url = generate_tts(response_text) if response_text else None
        
        return {
            "user_transcript": user_text,
            "llm_response": response_text,
            "audio_url": audio_url,
            "is_finished": is_finished,
            "final_report": final_report
        }
        
    finally:
        try:
            os.remove(path)
        except: pass
