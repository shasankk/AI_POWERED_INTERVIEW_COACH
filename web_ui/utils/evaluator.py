import json
import numpy as np
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

class AnswerEvaluator:
    def evaluate_answer(self, question, answer, context_skills=[]):
        """
        Uses Gemini AI to grade the answer semantically.
        """
        # Handle empty/short answers locally to save API calls
        if not answer or len(answer.strip()) < 5:
            return {
                "score": 0.0,
                "feedback": "No audible answer provided. Please try speaking clearly.",
                "relevance": 0.0,
                "keywords_found": []
            }
            
        prompt = f"""
        Act as a strict technical interviewer.
        Question Asked: "{question}"
        Candidate Answer: "{answer}"
        
        Task:
        Evaluate the answer for correctness, depth, and relevance.
        
        Output Constraints:
        Return ONLY a JSON object with these exact keys:
        - "score": A float between 0.0 and 10.0 (where 10 is perfect).
        - "feedback": A single sentence of constructive feedback.
        - "relevance": A float between 0.0 and 1.0.
        - "keywords_found": A list of technical terms mentioned in the answer.
        
        Example:
        {{
            "score": 7.5,
            "feedback": "Good explanation of polymorphism but missed runtime binding.",
            "relevance": 0.9,
            "keywords_found": ["polymorphism", "inheritance", "binding"]
        }}
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
                "temperature": 0.3
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=6.0)
            response.raise_for_status()
            
            content = response.json()["choices"][0]["message"]["content"].strip()
            
            # Clean Markdown content
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
                
            result = json.loads(content)
            
            # Ensure types are native (no numpy or strings where floats needed)
            return {
                "score": float(result.get("score", 0)),
                "feedback": str(result.get("feedback", "Evaluation failed.")),
                "relevance": float(result.get("relevance", 0)),
                "keywords_found": list(result.get("keywords_found", []))
            }
            
        except Exception as e:
            print(f"Gemini Eval Error: {e}")
            return {
                "score": 5.0,
                "feedback": "AI Evaluation encountered an error. Score is neutral.",
                "relevance": 0.5,
                "keywords_found": []
            }

    def generate_final_report(self, history, cv_score):
        """
        Aggregates scores.
        """
        scores = [h.get('evaluation', {}).get('score', 0) for h in history if 'evaluation' in h]
        avg_score = float(np.mean(scores)) if scores else 0.0
        
        final_weighted = (avg_score * 10 * 0.6) + (cv_score * 0.4)
        
        weak_answers = [h for h in history if h.get('evaluation', {}).get('score', 0) < 5.0]
        
        return {
            "final_score": round(float(final_weighted), 1),
            "interview_avg": round(float(avg_score), 1),
            "weak_points": weak_answers,
            "passed": bool(final_weighted > 60)
        }

evaluator_instance = None
def get_evaluator():
    global evaluator_instance
    if evaluator_instance is None:
        evaluator_instance = AnswerEvaluator()
    return evaluator_instance
