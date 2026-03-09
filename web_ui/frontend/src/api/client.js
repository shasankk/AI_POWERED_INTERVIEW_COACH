import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const client = axios.create({
    baseURL: API_URL
});

// Interceptor to attach JWT token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const apiService = {
    // Auth endpoints
    login: async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const res = await client.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        if (res.data.access_token) {
            localStorage.setItem('token', res.data.access_token);
        }
        return res.data;
    },

    register: async (fullName, email, password) => {
        const res = await client.post('/auth/register', {
            full_name: fullName,
            email: email,
            password: password
        });
        return res.data;
    },

    // Check API Status
    checkStatus: async () => {
        try {
            const response = await client.get('/');
            return response.data;
        } catch (error) {
            console.error("API Error", error);
            throw error;
        }
    },

    // Upload CV and JD for setup
    uploadAnalysis: async (cvFile, jdFile) => {
        const formData = new FormData();
        formData.append('cv_file', cvFile);
        formData.append('jd_file', jdFile);

        try {
            const response = await client.post('/interview/setup', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Analysis Error", error);
            throw error;
        }
    },

    // Reset/start the interview iteration
    resetInterview: async (sessionId) => {
        try {
            const response = await client.post(`/interview/reset?session_id=${sessionId}`);
            return response.data;
        } catch (error) {
            console.error("Interview Reset Error", error);
            throw error;
        }
    },

    // Process spoken audio answer
    processInterviewAnswer: async (sessionId, audioBlob) => {
        const formData = new FormData();
        formData.append('audio_data', audioBlob, 'answer.wav');

        try {
            const response = await client.post(`/interview/process?session_id=${sessionId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Interview Process Error", error);
            throw error;
        }
    }
};

export default apiService;
