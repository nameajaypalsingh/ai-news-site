const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const parser = new Parser();

// 1. Define Sources (Add more as needed)
const FEEDS = [
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
];

const OUTPUT_FILE = path.join(__dirname, '../public/news.json');

// Placeholder for AI Function
async function rewriteWithAI(article) {
    // TODO: Connect Gemini API here
    // For now, just return the original with a prefix to show it's "processed"
    return {
        title: `(AI) ${article.title}`,
        summary: article.contentSnippet || article.content,
        link: article.link,
        source: article.source,
        date: new Date().toISOString()
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

            // Take top 3 from each
            const topItems = feedData.items.slice(0, 3).map(item => ({
                ...item,
                source: feed.name
            }));
            allNews.push(...topItems);

        } catch (error) {
            console.error(`❌ Error fetching ${feed.name}:`, error.message);
        }
    }

    // 3. Process with "AI"
    console.log("🤖 Rewriting headlines...");
    const processedNews = await Promise.all(allNews.map(rewriteWithAI));

    // 4. Save to JSON
    // Ensure public dir exists
    const publicDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedNews, null, 2));
    console.log(`💾 Saved ${processedNews.length} articles to public/news.json`);
}

main();
