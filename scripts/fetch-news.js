require('dotenv').config();
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const parser = new Parser();

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Define Sources
const FEEDS = [
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
];

// Update output path to the Next.js web directory
const OUTPUT_FILE = path.join(__dirname, '../web/public/news.json');

// Real AI Function
async function rewriteWithAI(article) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ No Gemini API Key found, skipping AI rewrite.");
        return { ...article, title: `(No AI) ${article.title}` };
    }

    try {
        // Use gemini-2.5-flash as confirmed by listModels
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an AI journalist. Rewrite this news article for a tech news aggregator.
        
        Original Title: ${article.title}
        Original Snippet: ${article.contentSnippet || article.content}
        
        Task:
        1. Write a new, catchy title (max 10 words).
        2. Write a concise 2-sentence summary (max 40 words).
        3. Extract 2-3 relevant hashtags.
        
        Output format (JSON only):
        {
            "title": "New Title",
            "summary": "New Summary",
            "hashtags": ["#tag1", "#tag2"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(jsonStr);

        return {
            title: aiData.title,
            summary: aiData.summary,
            hashtags: aiData.hashtags,
            link: article.link,
            source: article.source,
            date: new Date().toISOString(),
            originalDate: article.pubDate
        };

    } catch (error) {
        console.error(`❌ AI Error on "${article.title}":`, error.message);
        // Fallback to original
        return {
            title: article.title,
            summary: article.contentSnippet?.slice(0, 150) + "...",
            link: article.link,
            source: article.source,
            date: new Date().toISOString()
        };
    }
}

async function main() {
    console.log("🔍 Fetching news from sources...");
    let allNews = [];

    // 2. Fetch from all feeds
    for (const feed of FEEDS) {
        try {
            const feedData = await parser.parseURL(feed.url);
            console.log(`✅ Fetched ${feedData.items.length} items from ${feed.name}`);

            // Take top 2 from each to save API rate limits during testing
            const topItems = feedData.items.slice(0, 2).map(item => ({
                ...item,
                source: feed.name
            }));
            allNews.push(...topItems);

        } catch (error) {
            console.error(`❌ Error fetching ${feed.name}:`, error.message);
        }
    }

    // 3. Process with AI
    console.log(`🤖 Rewriting ${allNews.length} headlines with Gemini...`);
    // Process in sequence to avoid hitting rate limits too hard (or use Promise.all for speed)
    const processedNews = [];
    for (const article of allNews) {
        const rewritten = await rewriteWithAI(article);
        processedNews.push(rewritten);
        // Small delay to be nice to the free tier
        await new Promise(r => setTimeout(r, 1000));
    }

    // 4. Save to JSON
    const publicDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedNews, null, 2));
    console.log(`💾 Saved ${processedNews.length} articles to public/news.json`);
}

main();
