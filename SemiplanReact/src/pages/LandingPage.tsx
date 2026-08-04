import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Brain, Calendar, ShieldCheck, CheckCircle2, ChevronRight, BookOpen, Star, Sparkles } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/30">
            {/* ── HEADER ── */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">SemiPlan</span>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
                        <a href="#articles" className="hover:text-indigo-600 transition-colors">Articles</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Log in</Link>
                        <Link to="/register" className="text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-md shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-lg transition-all">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── HERO SECTION ── */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-40 -right-20 w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                        <Sparkles className="w-4 h-4" /> The Future of Learning
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Master your studies with <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI-Powered Planning</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        SemiPlan automatically turns your syllabus into an actionable, smart study schedule. Learn faster, stay organized, and ace your exams without the stress.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/register" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all w-full sm:w-auto justify-center">
                            Start for Free <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a href="#how-it-works" className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-full font-bold text-lg shadow-md border border-slate-200 hover:bg-slate-50 transition-all w-full sm:w-auto justify-center">
                            See how it works
                        </a>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto mt-20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="bg-white p-4 rounded-[2rem] shadow-2xl border border-slate-100 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                        <div className="bg-slate-50 rounded-2xl h-[400px] border border-slate-100 flex items-center justify-center overflow-hidden relative">
                            {/* Dummy mockup UI */}
                            <div className="absolute top-0 left-0 w-full h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="w-full h-full pt-12 p-8 flex gap-6">
                                <div className="w-1/4 h-full bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
                                    <div className="w-full h-8 bg-slate-100 rounded-lg"></div>
                                    <div className="w-3/4 h-4 bg-slate-100 rounded"></div>
                                    <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                                </div>
                                <div className="flex-1 h-full bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <div className="w-1/3 h-8 bg-indigo-50 rounded-lg mb-6"></div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl"></div>
                                        <div className="h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl"></div>
                                        <div className="h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ABOUT / FEATURES SECTION ── */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">Why choose SemiPlan?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Everything you need to organize your academic life and boost your productivity.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Brain />} color="indigo" title="AI Syllabus Analysis" 
                            desc="Upload your course document and our AI instantly extracts chapters, deadlines, and study requirements." 
                        />
                        <FeatureCard 
                            icon={<Calendar />} color="emerald" title="Smart Scheduling" 
                            desc="We build a realistic study calendar around your personal availability to prevent burnout." 
                        />
                        <FeatureCard 
                            icon={<ShieldCheck />} color="amber" title="Progress Tracking" 
                            desc="Keep your motivation high with daily streaks, completion rates, and visual progress bars." 
                        />
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-sm mb-6">Simple Process</div>
                            <h2 className="text-4xl font-black text-slate-800 mb-6 leading-tight">From messy syllabus to perfect schedule in seconds.</h2>
                            
                            <div className="space-y-8 mt-10">
                                <Step number="1" title="Create your subject" desc="Enter basic course details and upload your syllabus file or image." />
                                <Step number="2" title="AI Magic" desc="Our intelligent engine parses topics and estimates the study hours needed." />
                                <Step number="3" title="Review & Execute" desc="Get a tailored calendar. Just follow the daily plan and ace your exams." />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-xl"></div>
                            <div className="bg-white p-8 rounded-3xl shadow-xl relative z-10 border border-slate-100">
                                <div className="space-y-4">
                                    <div className="h-12 bg-slate-50 rounded-xl flex items-center px-4 border border-slate-100">
                                        <BookOpen className="w-5 h-5 text-indigo-500 mr-3" />
                                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-12 bg-slate-50 rounded-xl flex items-center px-4 border border-slate-100">
                                        <Calendar className="w-5 h-5 text-emerald-500 mr-3" />
                                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                    </div>
                                    <div className="h-12 bg-slate-50 rounded-xl flex items-center px-4 border border-slate-100">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 mr-3" />
                                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ARTICLES SECTION ── */}
            <section id="articles" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Study Tips & Resources</h2>
                            <p className="text-slate-500">Read our latest articles on how to study smarter.</p>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                            View all articles <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ArticleCard 
                            tag="Productivity" 
                            title="The Pomodoro Technique: How to boost focus and avoid burnout" 
                            image="bg-gradient-to-br from-rose-400 to-orange-300"
                        />
                        <ArticleCard 
                            tag="AI in Education" 
                            title="How Artificial Intelligence is changing the way we prepare for exams" 
                            image="bg-gradient-to-br from-indigo-400 to-cyan-300"
                        />
                        <ArticleCard 
                            tag="Study Hacks" 
                            title="Active Recall vs Passive Reading: What science says about memory" 
                            image="bg-gradient-to-br from-emerald-400 to-teal-300"
                        />
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-slate-900 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
                    <div className="grid md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-black text-white">SemiPlan</span>
                            </div>
                            <p className="text-slate-400 max-w-sm mx-auto md:mx-0">
                                Empowering students worldwide to achieve their academic goals through smart, AI-driven study planning.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Product</h4>
                            <ul className="space-y-4 text-slate-400 text-sm font-medium">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Testimonials</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
                            <ul className="space-y-4 text-slate-400 text-sm font-medium">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 text-center text-slate-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} SemiPlan. All rights reserved. Built with ❤️ for students.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ── Components ── //

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) {
    const colorMap: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600 shadow-indigo-500/20",
        emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-500/20",
        amber: "bg-amber-50 text-amber-600 shadow-amber-500/20",
    };
    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colorMap[color]}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl border-4 border-white shadow-md">
                {number}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function ArticleCard({ tag, title, image }: { tag: string, title: string, image: string }) {
    return (
        <div className="group cursor-pointer">
            <div className={`w-full h-48 rounded-3xl ${image} mb-6 shadow-lg overflow-hidden relative`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 block">{tag}</span>
            <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                {title}
            </h3>
        </div>
    );
}
