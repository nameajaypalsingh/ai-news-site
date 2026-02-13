import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

type NewsItem = {
    title: string;
    summary: string;
    content?: string;
    slug?: string;
    link: string;
    source: string;
    date: string;
    hashtags?: string[];
    imageUrl?: string;
};

async function getNewsItem(slug: string): Promise<NewsItem | undefined> {
    // Read from the same JSON file
    const filePath = path.join(process.cwd(), 'public/news.json');
    try {
        if (fs.existsSync(filePath)) {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const news: NewsItem[] = JSON.parse(fileContents);
            // Safeguard: Only match items that HAVE a slug to avoid "undefined" matching fallback items
            return news.find((item) => item.slug && item.slug === slug);
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

            <article className="max-w-5xl mx-auto px-4 mt-8 md:mt-16">
                {/* Header */}
                <header className="mb-12 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                        <span className="bg-blue-100/50 text-blue-700 border border-blue-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {article.source}
                        </span>
                        <span className="text-gray-400 text-sm font-medium">
                            {new Date(article.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                        {article.title}
                    </h1>

                    {article.hashtags && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                            {article.hashtags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-default">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </header>

                {/* Content */}
                <div className="prose prose-xl md:prose-2xl prose-slate mx-auto md:mx-0 bg-white p-8 md:p-16 rounded-3xl shadow-sm border border-gray-100 mb-16 max-w-none">
                    <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        className="whitespace-pre-wrap leading-loose text-gray-700 font-serif"
                        components={{
                            img: ({ node, ...props }: any) => <img {...props} className="rounded-xl shadow-md my-8 w-full" />,
                            a: ({ node, ...props }: any) => <a {...props} className="text-blue-600 hover:underline font-bold" target="_blank" rel="noopener noreferrer" />,
                            h1: ({ node, ...props }: any) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4 text-gray-900" />,
                            h2: ({ node, ...props }: any) => <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-gray-900" />,
                            p: ({ node, ...props }: any) => <p {...props} className="mb-6 leading-relaxed" />,
                            ul: ({ node, ...props }: any) => <ul {...props} className="list-disc pl-6 mb-6 space-y-2" />,
                            ol: ({ node, ...props }: any) => <ol {...props} className="list-decimal pl-6 mb-6 space-y-2" />,
                            blockquote: ({ node, ...props }: any) => <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6 bg-gray-50 py-2 pr-2 rounded-r" />,
                        }}
                    >
                        {article.content || article.summary || ""}
                    </ReactMarkdown>
                </div>
                {/* Footer/Action */}
                <div className="border-t border-gray-100 pt-12 text-center pb-20">
                    <h3 className="text-gray-900 font-bold text-lg mb-6">Interested in the original source?</h3>
                    <Link
                        href={article.link}
                        target="_blank"
                        className="inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 shadow-xl hover:shadow-2xl"
                    >
                        Read full article on {article.source}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </Link>
                </div>
            </article>
        </main>
    );
}
