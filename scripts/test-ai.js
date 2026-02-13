require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAllModels() {
    // Access the Model Manager directly if possible, or infer from error
    // The current SDK exposes it via getGenerativeModel, but let's try a raw fetch to debug

    // Fallback: Using raw fetch to list models because SDK might mask it
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("❌ No models found or error:", data);
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error.message);
    }
}

listAllModels();
