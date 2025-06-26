require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001; // Default to port 3001 if not specified

// Configure CORS for your proxy server
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'], // Added GET method
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json()); // Middleware to parse JSON request bodies

// GET endpoint to fetch lead programs
app.get('/lead_programs', async (req, res) => {
    const leadProgramsUrl = "https://admission.multanust.edu.pk/v1/lead_programs";
    const username = process.env.API_USERNAME || "website";
    const password = process.env.API_PASSWORD || "ts$h1wztSyWQ";

    console.log('Fetching lead programs from:', leadProgramsUrl);
    console.log('Using credentials:', { username, password: password ? '***' : 'not set' });

    try {
        const response = await axios.get(leadProgramsUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'username': username,
                'password': password,
            },
        });
        
        console.log('Lead programs response status:', response.status);
        console.log('Lead programs response data:', response.data);
        
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Proxy server error (GET):', error.message);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Internal proxy server error', error: error.message });
        }
    }
});

// Add a test endpoint to verify the server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Proxy server is working', timestamp: new Date().toISOString() });
});

// POST endpoint for creating leads (existing functionality)
app.post('/', async (req, res) => {
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
        console.error('Proxy server error (POST):', error);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Internal proxy server error' });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`CORS_ORIGIN configured as: ${process.env.CORS_ORIGIN || '*'}`);
});
