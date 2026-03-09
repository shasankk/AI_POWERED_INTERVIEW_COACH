import speech_recognition as sr
import pyttsx3

# Initialize the recognizer
r = sr.Recognizer()
# Initialize text-to-speech engine
engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

print("Hello! I am ready. Say something!")

while True:
    try:
        with sr.Microphone() as source:
            print("Listening...")
            # Adjust for ambient noise for 0.2 seconds
            r.adjust_for_ambient_noise(source, duration=0.2)
            audio = r.listen(source)

            # Use Google Speech Recognition to convert speech to text
            text = r.recognize_google(audio)
            text = text.lower()

            print(f"You said: {text}")
            
            # Speak the recognized text back to the user
            speak(f"You said: {text}")

            if "exit" in text or "quit" in text:
                print("Exiting program...")
                speak("Goodbye!")
                break

    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")
        speak("Sorry, I could not connect to the speech recognition service.")

    except sr.UnknownValueError:
        print("Google Speech Recognition could not understand audio")
        speak("Sorry, I could not understand what you said. Please try again.")

    except KeyboardInterrupt:
        print("Program terminated by user")
        speak("Program terminated.")
        break
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        speak("An unexpected error occurred.")