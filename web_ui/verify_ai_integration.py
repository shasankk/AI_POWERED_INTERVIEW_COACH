from google import genai
import os

print("--- VERIFYING AI INTEGRATION ---")

try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set.")
        exit(1)
        
    # Initialize Client with the exact key used in the app
    client = genai.Client(api_key=api_key)
    
    # Test Prompt
    prompt = "Generate a short, one-sentence welcome message for a technical interview candidate."
    print(f"Sending Prompt to Gemini 1.5 Flash: '{prompt}'")
    
    # Call the Model
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    
    print("\n--- AI RESPONSE ---")
    print(response.text)
    print("-------------------")
    print("SUCCESS: AI Integration is working correctly.")
    
except Exception as e:
    print("\n--- AI ERROR ---")
    print(f"Error: {e}")
    print("----------------")
    print("FAILURE: AI Integration has issues.")
