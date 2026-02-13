import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                            AI
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            NewsDaily
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            Latest
                        </Link>
                        <Link href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            Trending
                        </Link>
                        <Link href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            Research
                        </Link>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-4">
                        <button className="hidden md:block px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
