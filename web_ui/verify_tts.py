from dotenv import load_dotenv
load_dotenv()
import os
from groq import Groq
client = Groq()
response = client.audio.speech.create(
    model="canopylabs/orpheus-v1-english",
    voice="autumn",
    response_format="wav",
    input="hi"
)
print(dir(response))
print(type(response))
