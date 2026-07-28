import { Link, Outlet } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export default function LandingLayout() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-text">
            <header className="sticky top-0 z-50 w-full h-[72px] glass border-b border-border shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary"><img src="https://res.cloudinary.com/dz0xmodpo/image/upload/v1778387204/Adminia_Logo_vhmg3p.png" alt="Adminia Logo" className="w-12 h-12" />Adminia</Link>    
                        {/* <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-text hover:text-primary font-medium transition-colors">Home</Link>
                            <a href="#features" className="text-text hover:text-primary font-medium transition-colors">Features</a>
                            <a href="#features" className="text-text hover:text-primary font-medium transition-colors">Process</a>
                        </nav> */}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link 
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 border border-text rounded-md text-text hover:text-primary hover:border-primary font-medium transition-colors">
                            <LogIn className="w-5 h-5" /> Login
                        </Link>

                        {/* <Link to="/register" className="flex items-center gap-2 bg-primary text-card px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            <UserPlus className="w-5 h-5" /> Register
                        </Link> */}
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-slate-900 text-slate-300 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Adminia</h3>
                        <p className="text-gray-400">A modern platform to manage your entire admission journey.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            {/* <li><a href="#features" className="hover:text-white transition-colors">Features</a></li> */}
                            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Resources</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Social</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
                    <p>© Adminia 2026 All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
