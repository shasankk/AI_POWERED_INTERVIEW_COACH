import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyAHPJPhQjbgLMeGswRA5EoqPhaAuXs2guk")

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")

print("\nTesting 'gemini-pro'...")
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hello")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with gemini-pro: {e}")
