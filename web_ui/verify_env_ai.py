from google import genai
import os
from dotenv import load_dotenv

# Load key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print("--- VERIFYING SECURE AI INTEGRATION ---")
print(f"Loaded API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

try:
    client = genai.Client(api_key=api_key)
    
    # Test Prompt
    prompt = "Reply with 'API Authenticated Successfully' if you can read this."
    
    # Call the Model
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    
    print("\n--- AI RESPONSE ---")
    print(response.text)
    print("-------------------")
    
except Exception as e:
    print("\n--- ERROR ---")
    print(f"Error: {e}")
