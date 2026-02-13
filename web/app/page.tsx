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
  slug?: string;
  content?: string;
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
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {item.source}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h2>

                  <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <Link
                      href={item.slug ? `/article/${item.slug}` : item.link}
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline"
                    >
                      Read Story
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </Link>
                  </div>
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
