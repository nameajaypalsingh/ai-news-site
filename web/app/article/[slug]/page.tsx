import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type NewsItem = {
    title: string;
    summary: string;
    content?: string;
    slug?: string;
    link: string;
    source: string;
    date: string;
    hashtags?: string[];
};

async function getNewsItem(slug: string): Promise<NewsItem | undefined> {
    // Read from the same JSON file
    const filePath = path.join(process.cwd(), 'public/news.json');
    try {
        if (fs.existsSync(filePath)) {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const news: NewsItem[] = JSON.parse(fileContents);
            return news.find((item) => item.slug === slug);
        }
        return undefined;
    } catch (e) {
        console.error("Error reading news for article:", e);
        return undefined;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const article = await getNewsItem(slug);
    if (!article) return { title: 'Article Not Found' };
    return {
        title: `${article.title} | AI News Daily`,
        description: article.summary,
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getNewsItem(slug);

    if (!article) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Navigation */}
            <nav className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors font-medium">
                        ← Back to News
                    </Link>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                            {article.source}
                        </span>
                        <span className="text-gray-500 text-sm">
                            {new Date(article.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extJQbold text-gray-900 mb-6 leading-tight">
                        {article.title}
                    </h1>

                    {article.hashtags && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {article.hashtags.map(tag => (
                                <span key={tag} className="text-blue-600 text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Content */}
                <div className="prose prose-lg prose-blue bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 mb-10">
                    {/* If content is markdown, we ideally render it. For now, simple text or html replacement */}
                    {/* Since simple parser, standard newline to break */}
                    <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                        {article.content || article.summary}
                    </div>
                </div>

                {/* Action */}
                <div className="text-center">
                    <Link
                        href={article.link}
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-gray-200"
                    >
                        Read Originals on {article.source}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </Link>
                    <p className="mt-4 text-xs text-gray-400">
                        AI-generated content based on original reporting.
                    </p>
                </div>
            </article>
        </main>
    );
}
