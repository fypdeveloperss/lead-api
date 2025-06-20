// api/index.js
const axios = require('axios');

// This is a Vercel serverless function
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }
    
    const targetApiUrl = process.env.TARGET_API_URL || "https://admission.multanust.edu.pk/v1/lead/create";
    const username = process.env.API_USERNAME || "website";
    const password = process.env.API_PASSWORD || "ts$h1wztSyWQ";
    
    try {
        const response = await axios.post(targetApiUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'username': username,
                'password': password,
            },
        });
        
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Proxy server error:', error);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).json({ message: 'No response from target API' });
        } else {
            // Something happened in setting up the request
            res.status(500).json({ message: 'Internal proxy server error' });
        }
    }
}
