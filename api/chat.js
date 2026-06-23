// api/chat.js
export default async function handler(req, res) {
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
                reply: "⚠️ Backend Config Error: GEMINI_API_KEY is missing from Vercel settings." 
            });
        }

        // Production-stable v1 endpoint with lowercase model name
        const apiURL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the official helpful AI assistant for the Toruk Makto Golf League. 
                               Be professional, concise, and polite.
                               
                               User question: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ 
                reply: `🛑 Google AI API Error: ${data.error.message} (Code: ${data.error.code})` 
            });
        }

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ reply: aiReply || "No text returned from AI." });

    } catch (error) {
        return res.status(500).json({ reply: `❌ Server Error: ${error.message}` });
    }
}
