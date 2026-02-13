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
  imageUrl?: string;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Today's <span className="text-blue-600">Headlines</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            AI-curated insights from the world's top tech sources. Updated every 4 hours.
          </p>
        </header>

        {news.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No news yet</h3>
            <p className="text-gray-500">Wait for the next AI update cycle.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* HERO SECTION (First Item) */}
            {news[0] && (
              <section className="relative group overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl transition-all hover:scale-[1.01] duration-500">
                {/* Background Image or Gradient */}
                <div className="absolute inset-0 z-0">
                  {news[0].imageUrl ? (
                    <img src={news[0].imageUrl} alt={news[0].title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                </div>

                <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-8 items-start min-h-[500px] justify-end">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-500/80 text-white border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                        Featured • {news[0].source}
                      </span>
                      <time className="text-gray-300 text-sm font-medium drop-shadow-md">
                        {new Date(news[0].date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </time>
                    </div>

                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
                      <Link href={news[0].slug ? `/article/${news[0].slug}` : news[0].link} className="hover:text-blue-200 transition-colors">
                        {news[0].title}
                      </Link>
                    </h2>

                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl drop-shadow-md line-clamp-3">
                      {news[0].summary}
                    </p>

                    <div className="pt-4">
                      <Link
                        href={news[0].slug ? `/article/${news[0].slug}` : news[0].link}
                        className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-all hover:gap-3 shadow-lg hover:shadow-xl"
                      >
                        Read Full Story
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* GRID SECTION (Rest of items) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.slice(1).map((item, index) => (
                <article key={index} className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden border border-gray-100">
                  {/* Card Image */}
                  <div className="h-48 overflow-hidden relative bg-gray-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br opacity-80 ${['from-blue-500 to-purple-600', 'from-emerald-400 to-cyan-500', 'from-orange-400 to-pink-500'][index % 3]}`} />
                    )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                      <Link href={item.slug ? `/article/${item.slug}` : item.link}>
                        {item.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-6 flex-1">
                      {item.summary}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <Link
                        href={item.slug ? `/article/${item.slug}` : item.link}
                        className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 flex items-center gap-2 transition-colors"
                      >
                        Read Story <span className="text-lg leading-none">→</span>
                      </Link>

                      {/* Hashtags as tiny dots/pills if available */}
                      {/* (Optional visual flair) */}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="max-w-6xl mx-auto px-4 mt-20 text-center text-gray-400 text-sm pb-8">
        Powered by AI • Automated News Aggregator
      </footer>
    </main>
  );
}
