require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

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
                'User-Agent': 'Mozilla/5.0 (compatible; ProxyServer/1.0)',
                'username': username,
                'password': password,
            },
            timeout: 15000, // 15 second timeout
            validateStatus: function (status) {
                return status >= 200 && status < 300; // Only accept success status codes
            }
        });
        
        console.log('✅ Success! Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        // Return the response data directly
        res.status(200).json(response.data);
        
    } catch (error) {
        console.error('❌ Proxy server error (GET):', error.message);
        
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
            
            // Return the actual error from the API
            res.status(error.response.status).json({
                error: 'External API error',
                status: error.response.status,
                message: error.response.data,
                originalError: error.message
            });
        } else if (error.code === 'ECONNABORTED') {
            res.status(408).json({ 
                error: 'Request timeout', 
                message: 'The external API took too long to respond' 
            });
        } else if (error.code === 'ENOTFOUND') {
            res.status(502).json({ 
                error: 'DNS resolution failed', 
                message: 'Could not resolve the external API hostname' 
            });
        } else {
            res.status(500).json({ 
                error: 'Internal proxy server error', 
                message: error.message,
                code: error.code
            });
        }
    }
});

// POST endpoint for creating leads
app.post('/create', async (req, res) => {
    const targetApiUrl = "https://admission.multanust.edu.pk/v1/lead/create";
    const username = process.env.API_USERNAME || "website";
    const password = process.env.API_PASSWORD || "ts$h1wztSyWQ";
    
    console.log('Creating lead with data:', req.body);
    
    try {
        const response = await axios.post(targetApiUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; ProxyServer/1.0)',
                'username': username,
                'password': password,
            },
            timeout: 15000
        });
        
        console.log('✅ Lead created successfully:', response.status);
        res.status(response.status).json(response.data);
        
    } catch (error) {
        console.error('❌ Proxy server error (POST):', error.message);
        
        if (error.response) {
            console.error('Error response:', error.response.status, error.response.data);
            res.status(error.response.status).json({
                error: 'Failed to create lead',
                status: error.response.status,
                message: error.response.data
            });
        } else {
            res.status(500).json({ 
                error: 'Internal proxy server error',
                message: error.message 
            });
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Proxy server is working', 
        timestamp: new Date().toISOString(),
        endpoints: {
            'GET /lead_programs': 'Fetch available programs',
            'POST /create': 'Create a new lead',
            'GET /health': 'Health check',
            'GET /test': 'This endpoint'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
    console.log(`🌍 CORS_ORIGIN: ${process.env.CORS_ORIGIN || '*'}`);
    console.log(`📝 Available endpoints:`);
    console.log(`   GET  /lead_programs - Fetch programs`);
    console.log(`   POST /create - Create lead`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /test - Test endpoint`);
});
