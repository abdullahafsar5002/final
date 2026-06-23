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
        const primaryKey = process.env.GEMINI_API_KEY;
        const backupKey = process.env.GEMINI_API_KEY_BACKUP;

        if (!primaryKey) {
            return res.status(200).json({ 
                reply: "⚠️ Backend Config Error: The primary `GEMINI_API_KEY` is missing in Vercel settings." 
            });
        }

        // Reusable function to execute API calls
        const callGemini = async (apiKey) => {
            const apiURL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
            return await response.json();
        };

        // Execution Step 1: Run with primary key
        let data = await callGemini(primaryKey);

        // Execution Step 2: KEY ROTATION
        // If primary key returns a 429 rate limit error, instantly switch to the backup key
        if (data.error && (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED')) {
            if (backupKey) {
                console.warn("Primary API key quota hit. Rotating to backup API key...");
                data = await callGemini(backupKey);
            }
        }

        // Handle structural API errors
        if (data.error) {
            return res.status(200).json({ 
                reply: `🛑 Google AI API Error: ${data.error.message} (Code: ${data.error.code})` 
            });
        }

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ reply: aiReply || "Received an empty response from Google AI." });

    } catch (error) {
        return res.status(500).json({ reply: `❌ Server Connection Error: ${error.message}` });
    }
}
