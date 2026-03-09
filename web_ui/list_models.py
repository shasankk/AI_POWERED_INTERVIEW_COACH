from google import genai
import os

print("--- LISTING AVAILABLE MODELS ---")

try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set.")
        exit(1)
        
    client = genai.Client(api_key=api_key)
    for model in client.models.list():
        print(model.name)
except Exception as e:
    print(f"Error listing models: {e}")
