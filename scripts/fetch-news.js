require('dotenv').config();
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const he = require('he');
const TurndownService = require('turndown');

const parser = new Parser();
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Define Sources
const FEEDS = [
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
    { name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
    { name: 'Google DeepMind', url: 'https://deepmind.google/discover/blog/feed/' },
    { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss' }
];

// Update output path to the Next.js web directory
const OUTPUT_FILE = path.join(__dirname, '../web/public/news.json');

// Real AI Function
// Helper to create slugs
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

// Real AI Function
async function rewriteWithAI(article) {
    const slug = generateSlug(article.title);

    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ No Gemini API Key found, skipping AI rewrite.");
        return {
            ...article,
            title: `(No AI) ${article.title}`,
            slug: slug
        };
    }

    // Retry configuration
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 20000; // 20 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Revert to gemini-2.5-flash (known working)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
            You are an AI journalist. Rewrite this news article into an engaging, expanded blog post (around 300 words).
            
            Article:
            Title: ${article.title}
            Content: ${article.contentSnippet || article.content}
            Source: ${article.source}
            
            Return valid JSON with these fields:
            - title: A catchy new title
            - summary: A 2-sentence summary/hook
            - content: The full rewritten article in Markdown format
            - hashtags: An array of 3 relevant hashtags
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            // Clean up markdown code blocks if Gemini wraps JSON in them
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const aiData = JSON.parse(text);

                return {
                    ...aiData, // title, summary, content, hashtags
                    slug: slug, // Use consistent slug based on original title
                    link: article.link, // Keep original link as "Source"
                    source: article.source,
                    date: new Date().toISOString(),
                    originalDate: article.pubDate,
                    imageUrl: article.imageUrl // Pass through the original image URL
                };
            } catch (e) {
                console.error("❌ Error parsing AI JSON:", e.message);
                console.log("Raw AI response:", text);
                throw e; // Retry if parsing fails? Maybe not, usually deterministic.
            }

        } catch (error) {
            const isRateLimit = error.message.includes('429') || error.message.includes('Quota exceeded');

            if (isRateLimit && attempt < MAX_RETRIES) {
                console.warn(`⏳ Rate limit hit on "${article.title}". Retrying in ${RETRY_DELAY_MS / 1000}s... (Attempt ${attempt}/${MAX_RETRIES})`);
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                continue; // Retry
            }

            console.error(`❌ AI Error on "${article.title}" (Attempt ${attempt}):`, error.message);

            // If it's the last attempt, fall through to fallback
            if (attempt === MAX_RETRIES) break;
        }
    }

    // Fallback logic
    console.log(`⚠️ Using fallback content for "${article.title}"`);

    let fallbackContent = article.content || article.contentSnippet || '';

    // If fallback is too short (under 500 chars), append generic "Analysis" to fill space
    if (fallbackContent.length < 500) {
        fallbackContent += `
        
### Why This Matters

This development highlights the rapidly evolving landscape of artificial intelligence. As companies like ${article.source} report on these changes, it becomes clear that the integration of AI into daily workflows and consumer products is accelerating.

### The Bigger Picture

Experts suggest that moves like this could set new industry standards. While details are still emerging, the implications for privacy, efficiency, and market competition are significant. We will continue to monitor this story as it develops.

*Note: This summary was auto-generated from a limited source snippet. Please visit the original article for the full investigation.*
        `;
    }

    return {
        title: article.title,
        summary: article.contentSnippet || article.content, // Use full content if valid, else snippet
        content: fallbackContent, // Fallback content for the page
        link: article.link,
        slug: slug, // CRITICAL: Always provide a slug
        source: article.source,
        date: new Date().toISOString(),
        imageUrl: article.imageUrl,
        hashtags: ["#TechNews", "#AI"] // Generic tags for fallback
    };
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
            const topItems = feedData.items.slice(0, 2).map(item => {
                let imageUrl = item.enclosure?.url || item.itunes?.image || item.media?.thumbnail?.[0]?.url || item.media?.content?.[0]?.url;

                // Fallback: Try to extract from content if no specific tag exists
                if (!imageUrl && (item.content || item.contentSnippet)) {
                    // Match src="URL" or src='URL'
                    const imgMatch = (item.content || item.contentSnippet).match(/<img[^>]+src=["']([^"']+)["']/i);
                    if (imgMatch) {
                        imageUrl = imgMatch[1];
                    }
                }

                // Clean up content by decoding HTML entities
                const cleanTitle = he.decode(item.title || '');
                let cleanContent = he.decode(item.content || item.contentSnippet || '');

                // Convert HTML to Markdown for consistency
                try {
                    cleanContent = turndownService.turndown(cleanContent);
                } catch (e) {
                    console.warn(`⚠️ Markdown conversion failed for ${item.title}, using raw text`);
                }

                const cleanSnippet = he.decode(item.contentSnippet || '');

                return {
                    ...item,
                    title: cleanTitle,
                    content: cleanContent, // Now assured to be Markdown
                    contentSnippet: cleanSnippet,
                    source: feed.name,
                    imageUrl: imageUrl
                };
            });
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
        // Generous delay to be nice to the free tier (4 seconds)
        await new Promise(r => setTimeout(r, 4000));
    }

    // 4. Save to JSON
    const publicDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedNews, null, 2));
    console.log(`💾 Saved ${processedNews.length} articles to public/news.json`);
}

main();
