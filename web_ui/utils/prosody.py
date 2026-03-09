import wave
import contextlib
import re

FILLER_WORDS = {"um", "uh", "like", "you know", "so", "actually", "basically"}

def get_audio_duration(file_path: str) -> float:
    """Returns the duration of a wav file in seconds."""
    try:
        with contextlib.closing(wave.open(file_path, 'r')) as f:
            frames = f.getnframes()
            rate = f.getframerate()
            duration = frames / float(rate)
            return duration
    except Exception as e:
        print(f"Error reading audio duration: {e}")
        return 0.0

def analyze_prosody(audio_path: str, transcript: str) -> dict:
    """
    Analyzes basic prosody features: WPM (Speech Rate) and Filler word frequency.
    """
    duration = get_audio_duration(audio_path)
    
    words = [w.lower() for w in re.findall(r'\b\w+\b', transcript)]
    word_count = len(words)
    
    # Calculate WPM (Words Per Minute)
    wpm = 0.0
    if duration > 0:
        wpm = (word_count / duration) * 60.0
        
    # Count Filler Words
    filler_count = 0
    for word in words:
        if word in FILLER_WORDS:
            filler_count += 1
            
    # Simple heuristics for feedback
    feedback = []
    if wpm > 160:
        feedback.append("You are speaking a bit too fast. Try to slow down.")
    elif 0 < wpm < 110:
        feedback.append("Your speech rate is a bit slow. Try to speak a bit faster to maintain engagement.")
        
    if filler_count > 3:
        feedback.append(f"You used {filler_count} filler words. Try pausing instead of saying 'um' or 'like'.")
        
    return {
        "duration_seconds": round(duration, 2),
        "word_count": word_count,
        "wpm": round(wpm, 1),
        "filler_count": filler_count,
        "feedback": feedback
    }
