import { Link } from 'react-router-dom';

const HowItWorks = () => {
    return (
        <div style={{ padding: '2rem', color: 'var(--text-main)', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <Link to="/" className="return-home" style={{ position: 'absolute', top: '2rem', left: '-10rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-arrow-left"></i> Return Home
            </Link>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>How It Works</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                The AI Mock Interviewer is designed to simulate a real-world technical interview environment. Here is a breakdown of the process:
            </p>
            <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--card-bg)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>1. Document Contextualization</h3>
                <p>You begin by uploading your Resume/CV alongside the target Job Description. Our backend NLP engine analyzes the overlap to generate hyper-specific technical questions tailored to your profile.</p>
            </div>
            <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--card-bg)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>2. Live Session & Proctoring</h3>
                <p>During the interview, TensorFlow's facial tracking monitors your eye flow to ensure interview integrity. You speak your answers naturally.</p>
            </div>
            <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--card-bg)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>3. Prosody and Content Analysis</h3>
                <p>Your spoken audio is transcribed via Whisper and sent to Google Gemini for content grading, while a local algorithm calculates your Words-Per-Minute and filler-word usage (prosody).</p>
            </div>
            <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--card-bg)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>4. Comprehensive Reporting</h3>
                <p>Review your results on the Dashboard to see your cumulative scores, weak points, and specific feedback on how to improve your delivery and technical accuracy.</p>
            </div>
        </div>
    );
};

export default HowItWorks;
