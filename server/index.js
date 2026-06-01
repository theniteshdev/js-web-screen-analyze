import express from 'express';
import fetch from 'node-fetch'; // Standard fetch in Node 18+, or use axios
import { loadEnv } from "./utils.js"
import cors from 'cors';

const app = express();
// Ensure your server can handle larger JSON payloads for base64 strings
app.use(cors()); // Allow local Chrome execution runtime spaces to query route elements
app.use(express.json({ limit: '50mb' }));
loadEnv();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/analyze-image', async (req, res) => {
    try {
        const { base64Image } = req.body;

        if (!base64Image) {
            return res.status(400).json({ error: 'Missing base64Image in request body' });
        }

        // Clean up the base64 string if the client included the data URI prefix
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // Optional but recommended by OpenRouter:
                'HTTP-Referer': 'http://localhost:3343',
                'X-Title': 'Image Analysis extension\' server',
            },
            body: JSON.stringify({
                // You can use other vision models like 'openai/gpt-4o-mini' or 'anthropic/claude-3.5-sonnet'
                model: 'google/gemini-2.5-flash',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Analyze this image in detail and describe everything that is visible.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    // This is the crucial part for sending base64 to OpenRouter
                                    url: `data:image/jpeg;base64,${cleanBase64}`
                                }
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || 'OpenRouter API Error' });
        }

        // Extract the text analysis from the response
        const analysis = data.choices[0].message.content;
        console.log(analysis)
        res.json({ success: true, analysis });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000')
});