from google import genai
import os

print("--- LISTING AVAILABLE MODELS ---")

try:
    client = genai.Client(api_key="AIzaSyAHPJPhQjbgLMeGswRA5EoqPhaAuXs2guk")
    for model in client.models.list():
        print(model.name)
except Exception as e:
    print(f"Error listing models: {e}")
