// api/chat.js
export default async function handler(req, res) {
    // Standard headers allowing your frontend to speak with this file safely
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
            return res.status(200).json({ reply: "Setup Error: API Key is missing inside Vercel Environment Variables." });
        }

        // FIX: Using the universally stable gemini-1.5-flash engine endpoint
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the official helpful AI assistant for the Toruk Makto Golf League. 
                               Be professional, concise, and polite. 
                               Help users understand schedules, rosters, and registration details.
                               
                               User says: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // DEBUGGING: If Google rejects the key or endpoint, show the exact error message in the chat
        if (data.error) {
            return res.status(200).json({ 
                reply: `Google API Error: ${data.error.message} (Status Code: ${data.error.code})` 
            });
        }

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiReply) {
            return res.status(200).json({ reply: "Google AI responded, but didn't return text content. Please try again." });
        }
        
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: `Server connection failure: ${error.message}` });
    }
}
