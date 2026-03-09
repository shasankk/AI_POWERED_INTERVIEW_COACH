import React from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
    return (
        <div style={{ padding: '2rem', color: 'var(--text-main)', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <Link to="/" className="return-home" style={{ position: 'absolute', top: '2rem', left: '-10rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-arrow-left"></i> Return Home
            </Link>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Frequently Asked Questions</h1>

            <div className="faq-item" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Q: What happens if I move my head during the interview?</h3>
                <p style={{ lineHeight: 1.6 }}>A: The AI proctoring system is designed to detect significant deviations. Minor movements are fine, but consistently looking away from the screen will trigger an alert and be recorded in your final report.</p>
            </div>

            <div className="faq-item" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Q: How is my audio analyzed?</h3>
                <p style={{ lineHeight: 1.6 }}>A: Your audio is sent to a Whisper STT (Speech-to-Text) module to generate a transcript. Simultaneously, we analyze the raw audio file to measure your speech rate (Words Per Minute) and identify filler words like 'um' and 'uh'.</p>
            </div>

            <div className="faq-item" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Q: Is my data stored securely?</h3>
                <p style={{ lineHeight: 1.6 }}>A: Yes, all session data and transcripts are tied to your secure JWT-authenticated account. Audio files are processed and then immediately discarded from the temporary server storage.</p>
            </div>

            <div className="faq-item" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Q: What LLM is used for the technical grading?</h3>
                <p style={{ lineHeight: 1.6 }}>A: We utilize Google's Gemini-2.0-Flash to provide rapid, high-context feedback on your answers by comparing them directly against the required skills found in the Job Description.</p>
            </div>
        </div>
    );
};

export default FAQ;
