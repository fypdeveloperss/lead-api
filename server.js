require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001; // Default to port 3001 if not specified

// Configure CORS for your proxy server
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json()); // Middleware to parse JSON request bodies

// Define the proxy endpoint
app.post('/api/create-lead', async (req, res) => {
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
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ message: 'Internal proxy server error' });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`CORS_ORIGIN configured as: ${process.env.CORS_ORIGIN || '*'}`);
});