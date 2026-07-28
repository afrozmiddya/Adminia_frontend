import { Link } from 'react-router-dom';
import { FileText, UploadCloud, CheckCircle, ArrowRight, UserPlus, LogIn, ChevronRight } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-background py-20 lg:py-32">
                <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-[48px] font-bold text-text leading-tight mb-6">
                                Student Admission <br />
                                <span className="text-primary">Made Simple</span>
                            </h1>
                            <p className="text-lg md:text-xl text-text/75 mb-8 leading-relaxed">
                                A modern platform to manage your entire admission journey from application to approval.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login" className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium border-2 rounded-xl text-white bg-primary hover:bg-primary/90 transition-all shadow-sm">
                                    Login Now <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link to="/admin-login" className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-border rounded-xl text-base font-medium text-text bg-card hover:bg-border/40 transition-all shadow-sm">
                                    Super Admin Login <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative rounded-2xl bg-card border border-border overflow-hidden shadow-2xl">
                                <div className="h-8 bg-card border-b border-border flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="p-6 bg-background space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1/4 h-24 bg-card rounded-lg border border-border p-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 mb-3" />
                                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
                                        </div>
                                        <div className="w-1/4 h-24 bg-card rounded-lg border border-border p-4">
                                            <div className="w-8 h-8 rounded-full bg-success/20 mb-3" />
                                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
                                        </div>
                                        <div className="flex-1 h-24 bg-card rounded-lg border border-border p-4" />
                                    </div>
                                    <div className="h-48 bg-card rounded-lg border border-border p-4">
                                        <div className="w-full h-full border border-dashed border-border rounded flex items-center justify-center">
                                            <span className="text-text/50 font-medium">Dashboard Preview</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-[32px] font-bold text-text mb-4">Powerful & Easy to Use</h2>
                        <p className="text-text/75 max-w-2xl mx-auto">Everything you need to complete your admission process efficiently.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-[20px] font-semibold text-text mb-3">Online Application</h3>
                            <p className="text-text/75 leading-relaxed">Submit admission applications digitally with ease and minimal friction.</p>
                        </div>
                        {/* Card 2 */}
                        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <h3 className="text-[20px] font-semibold text-text mb-3">Upload Documents</h3>
                            <p className="text-text/75 leading-relaxed">Securely upload documents and certificates for instant verification.</p>
                        </div>
                        {/* Card 3 */}
                        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-[20px] font-semibold text-text mb-3">Track Status</h3>
                            <p className="text-text/75 leading-relaxed">Track admission progress in real time directly from your dashboard.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
