import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

def generate_interview_questions(matched_skills, missing_skills, max_questions=5):
    """
    Generates dynamic interview questions using Gemini.
    """
    matched_str = ", ".join(list(matched_skills)) if matched_skills else "General Tech"
    missing_str = ", ".join(list(missing_skills)) if missing_skills else "None"
    
    prompt = f"""
    You are an expert technical interviewer.
    Candidate Profile:
    - Proven Skills: {matched_str}
    - Missing/Gap Skills: {missing_str}
    
    Task:
    Generate exactly {max_questions} technical interview questions.
    
    Constraints:
    1. Include 2 questions about Object-Oriented Programming (OOP).
    2. Include 1 question about Database Management Systems (DBMS).
    3. The remaining questions should probe their proven skills or test their aptitude for the missing skills.
    4. Questions should be concise and conversational.
    5. Return ONLY a raw JSON array of strings. Do not use Markdown formatting.
    
    Example Output:
    ["Question 1", "Question 2", "Question 3"]
    """
    
    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "meta-llama/llama-3.3-70b-instruct", 
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=6.0)
        response.raise_for_status()
        
        content = response.json()["choices"][0]["message"]["content"].strip()
        
        # Clean up potential markdown formatting
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        questions = json.loads(content)
        
        # Fallback if Gemini returns something else
        if not isinstance(questions, list):
            raise ValueError("API returned non-list JSON")
            
        return questions[:max_questions]
        
    except Exception as e:
        print(f"Gemini Generation Error: {e}")
        # Fallback questions if API fails or quota exceeded
        return [
            "Can you explain the four pillars of OOP?",
            "What are ACID properties in a database?",
            "Describe a challenging technical problem you solved.",
            "How do you handle error handling in your code?",
            "Do you have experience with REST APIs?"
        ]
