// api/chat.js
export default async function handler(req, res) {
    // Enable CORS headers so your frontend can communicate securely
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ 
                reply: "⚠️ Backend Config Error: The `GEMINI_API_KEY` is missing in Vercel Environment Variables." 
            });
        }

        // Using the highly stable Gemini 1.5 Flash API endpoint
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the official helpful AI assistant for the Toruk Makto Golf League. 
                               Keep your responses friendly, concise, and focused on golf or league support.
                               
                               User question: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // Catch errors sent back directly from Google's servers
        if (data.error) {
            return res.status(200).json({ 
                reply: `🛑 Google AI API Error: ${data.error.message} (Code: ${data.error.code})` 
            });
        }

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiReply) {
            return res.status(200).json({ 
                reply: "Empty response received from Google AI. Please try rephrasing your sentence." 
            });
        }
        
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: `❌ Server Crash Error: ${error.message}` });
    }
}
