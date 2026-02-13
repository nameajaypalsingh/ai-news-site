require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

const NEWS_FILE = path.join(__dirname, '../public/news.json');
const LOG_FILE = path.join(__dirname, '../data/posted_log.json');
const SITE_URL = 'https://ai-news-site.vercel.app'; // Replace with real URL later

async function postToX() {
    // 1. Check Keywords
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET ||
        !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_SECRET) {
        console.error("❌ Missing Twitter Keys. Skipping social post.");
        return;
    }

    // 2. Init Client
    const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const rwClient = client.readWrite;

    // 3. Read News & Log
    let news = [];
    let postedLog = [];

    try {
        if (fs.existsSync(NEWS_FILE)) {
            news = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
        }

        // Ensure data dir exists
        const dataDir = path.dirname(LOG_FILE);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        if (fs.existsSync(LOG_FILE)) {
            postedLog = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Error reading files:", e);
        return;
    }

    // 4. Find new article
    // We only post the *latest* one that hasn't been posted yet to avoid spamming
    const newArticle = news.find(article => !postedLog.includes(article.link));

    if (!newArticle) {
        console.log("✅ No new articles to tweet.");
        return;
    }

    // 5. Construct Tweet
    // "Title #Hashtags Link"
    const tags = newArticle.hashtags ? newArticle.hashtags.join(' ') : '#TechNews';
    const tweetText = `${newArticle.title}\n\n${tags}\n${SITE_URL}`;

    try {
        console.log(`🐦 Tweeting: ${newArticle.title}`);
        await rwClient.v2.tweet(tweetText);

        // 6. Update Log
        postedLog.push(newArticle.link);
        // Keep log small (last 100)
        if (postedLog.length > 100) postedLog.shift();

        fs.writeFileSync(LOG_FILE, JSON.stringify(postedLog, null, 2));
        console.log("✅ Tweet sent and logged!");

    } catch (error) {
        console.error("❌ Error posting to X:", error);
    }
}

// postToX(); // Disabled until user has valid Twitter Credits
console.log("X Bot skipped (Twitter Credits required)");
