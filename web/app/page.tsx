import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI News Daily',
  description: 'Automated AI News Aggregator',
};

type NewsItem = {
  title: string;
  summary: string;
  link: string;
  source: string;
  date: string;
};

async function getNews(): Promise<NewsItem[]> {
  // In a real build, we might fetch this from an API or read file at build time
  // For static generation, reading from public/news.json works if it exists at build time
  const filePath = path.join(process.cwd(), 'public/news.json');
  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents);
    }
    return [];
  } catch (e) {
    console.error("Error reading news:", e);
    return [];
  }
}

export default async function Home() {
  const news = await getNews();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>🤖</span>
            <span>AI News <span className="text-blue-600">Daily</span></span>
          </h1>
          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            Last Update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* News Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        {news.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <p className="text-lg mb-2">No news found yet.</p>
            <p className="text-sm">Run the scraper script to populate data!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <article key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-200 border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border border-blue-100">
                      {item.source}
                    </span>
                    <time className="text-[11px] text-gray-400 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </time>
                  </div>

                  <h2 className="text-lg font-bold mb-3 leading-snug text-gray-900 group-hover:text-blue-600">
                    <Link href={item.link} target="_blank" className="hover:underline decoration-2 decoration-blue-100 underline-offset-2">
                      {item.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-4 flex-1">
                    {item.summary}
                  </p>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 group">
                  <Link
                    href={item.link}
                    target="_blank"
                    className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    Read on {item.source} <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="max-w-6xl mx-auto px-4 mt-20 text-center text-gray-400 text-sm pb-8">
        Powered by AI • Automated News Aggregator
      </footer>
    </main>
  );
}
