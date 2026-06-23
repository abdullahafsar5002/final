// api/chat.js
export default async function handler(req, res) {
    // 1. Enable standard CORS headers so your frontend can communicate securely
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the preflight OPTIONS request from the browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // Verify the environment variable exists
        if (!apiKey) {
            return res.status(200).json({ 
                reply: "⚠️ Backend Config Error: The `GEMINI_API_KEY` environment variable is missing in your Vercel project settings." 
            });
        }

        // 2. STABLE ENDPOINT: Using v1 production API with exact lowercase model identifier
        const apiURL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the official helpful AI assistant for the Toruk Makto Golf League. 
                               Keep your responses professional, concise, and focused on golf or league support.
                               
                               User question: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // 3. DIAGNOSTIC CATCH: Intercept explicit error returns from Google's servers
        if (data.error) {
            return res.status(200).json({ 
                reply: `🛑 Google AI API Error: ${data.error.message} (Code: ${data.error.code})` 
            });
        }

        // Extract the text reply from Google's response object safely
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiReply) {
            return res.status(200).json({ 
                reply: "Received an empty response from Google AI. Please try rephrasing your sentence." 
            });
        }
        
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        // Handle runtime connection failures or server drops
        return res.status(500).json({ reply: `❌ Server Connection Error: ${error.message}` });
    }
}
