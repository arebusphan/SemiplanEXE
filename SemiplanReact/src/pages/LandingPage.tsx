import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Brain, Calendar, ShieldCheck, CheckCircle2, ChevronRight, BookOpen, Sparkles, UploadCloud, FileText, Clock, Target, ListTodo, Users, Zap, TrendingUp, BookOpenCheck } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#fafafc] font-sans selection:bg-indigo-500/30">
            {/* ── HEADER ── */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-800">SemiPlan</span>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-10 text-[15px] font-bold text-slate-500">
                        <a href="#features" className="hover:text-[#6366f1] transition-colors">Tính năng</a>
                        <a href="#how-it-works" className="hover:text-[#6366f1] transition-colors">Cách hoạt động</a>
                        <a href="#about" className="hover:text-[#6366f1] transition-colors">Về chúng tôi</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-[15px] font-bold text-slate-600 hover:text-[#6366f1] transition-colors">Đăng nhập</Link>
                        <Link to="/register" className="text-[15px] font-bold bg-[#6366f1] text-white px-6 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:bg-[#4f46e5] hover:-translate-y-0.5 transition-all">
                            Bắt đầu ngay
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── HERO SECTION ── */}
            <section className="pt-36 pb-20 px-6 relative overflow-hidden">
                {/* Background glows */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="max-w-4xl mx-auto text-center relative z-10 pt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/50 text-[#6366f1] text-xs font-black uppercase tracking-widest mb-8 shadow-sm">
                        <Sparkles className="w-4 h-4" /> Dành cho sinh viên 🎓
                    </div>
                    <h1 className="text-[3.5rem] md:text-[5rem] font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                        Lập kế hoạch học tập <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">thông minh</span> cho sinh viên
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        SemiPlan sử dụng AI để phân tích môn học, tạo lộ trình cá nhân hóa, tối ưu thời gian và giúp bạn học tập hiệu quả mỗi ngày.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="flex items-center gap-2 bg-[#6366f1] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-500/30 hover:bg-[#4f46e5] hover:scale-105 transition-all w-full sm:w-auto justify-center">
                            Trải nghiệm miễn phí <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a href="#how-it-works" className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-slate-200/50 border border-slate-100 hover:bg-slate-50 hover:scale-105 transition-all w-full sm:w-auto justify-center">
                            Tìm hiểu thêm
                        </a>
                    </div>
                </div>

                {/* Hero Pure CSS UI Mockup */}
                <div className="max-w-6xl mx-auto mt-24 relative z-10 perspective-1000">
                    <div className="bg-slate-100/50 p-4 rounded-[2.5rem] shadow-2xl border border-slate-200/50 backdrop-blur-sm transform rotate-x-12 scale-100 hover:scale-[1.02] transition-transform duration-700">
                        <div className="bg-white rounded-[2rem] h-[550px] shadow-inner overflow-hidden flex flex-col border border-slate-100">
                            {/* Browser Header */}
                            <div className="h-14 border-b border-slate-100 flex items-center px-6 gap-4 bg-slate-50/50">
                                <div className="flex gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
                                </div>
                                <div className="flex-1 bg-white rounded-md h-8 border border-slate-200/60 max-w-xl flex items-center px-4">
                                    <span className="text-xs text-slate-400 font-medium">semiplan.com/dashboard</span>
                                </div>
                            </div>
                            {/* App Content */}
                            <div className="flex-1 flex bg-slate-50/30">
                                {/* Sidebar */}
                                <div className="w-64 border-r border-slate-100 p-6 hidden md:block">
                                    <div className="flex items-center gap-2 mb-10">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
                                        <span className="font-black text-slate-800">SemiPlan</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-10 bg-indigo-50 rounded-xl border border-indigo-100/50 flex items-center px-4 gap-3"><Target className="w-5 h-5 text-indigo-600" /><div className="h-3 w-20 bg-indigo-200 rounded" /></div>
                                        <div className="h-10 rounded-xl flex items-center px-4 gap-3"><Calendar className="w-5 h-5 text-slate-400" /><div className="h-3 w-16 bg-slate-200 rounded" /></div>
                                        <div className="h-10 rounded-xl flex items-center px-4 gap-3"><CheckCircle2 className="w-5 h-5 text-slate-400" /><div className="h-3 w-24 bg-slate-200 rounded" /></div>
                                    </div>
                                </div>
                                {/* Main content mockup */}
                                <div className="flex-1 p-8 overflow-hidden">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Xin chào, Sinh viên 👋</h2>
                                            <p className="text-slate-500 font-medium text-sm">Hôm nay bạn sẽ học gì?</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 border-2 border-white shadow-md"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        {/* Card 1 */}
                                        <div className="col-span-2 bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/40 border border-indigo-50 relative overflow-hidden">
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl" />
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpenCheck className="w-6 h-6" /></div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">Cấu trúc dữ liệu</h3>
                                                        <p className="text-xs text-slate-500 font-medium mt-1">Sắp tới deadline: Assignment 2</p>
                                                    </div>
                                                </div>
                                                <div className="w-16 h-16 rounded-full border-4 border-indigo-50 flex items-center justify-center relative">
                                                    <svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="28" cy="28" r="28" className="stroke-indigo-500" strokeWidth="4" fill="none" strokeDasharray="175" strokeDashoffset="40" /></svg>
                                                    <span className="text-sm font-black text-indigo-600">72%</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div></div>
                                                    <span className="text-sm font-semibold text-slate-700 flex-1">Ôn tập cây nhị phân</span>
                                                    <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm">14:00</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 opacity-60">
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                                                    <span className="text-sm font-semibold text-slate-500 flex-1">Làm bài tập đồ thị</span>
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">16:30</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Card 2 */}
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/30 relative overflow-hidden">
                                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full" />
                                            <Zap className="w-8 h-8 text-yellow-300 mb-6 drop-shadow-md" />
                                            <h3 className="font-bold text-xl mb-2">Tiến độ tuần này</h3>
                                            <div className="flex items-end gap-2 mb-4">
                                                <span className="text-4xl font-black">12</span>
                                                <span className="text-white/80 font-medium mb-1">giờ học</span>
                                            </div>
                                            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                                                <div className="w-[80%] bg-white h-full rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES SECTION ── */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">Tại sao chọn SemiPlan?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">Hệ thống thông minh phân tích và thiết kế lộ trình dành riêng cho bạn, giúp việc tự học không còn là gánh nặng.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard 
                            icon={<Brain className="w-7 h-7 text-[#6366f1]" />} bg="bg-indigo-50" border="border-indigo-100" shadow="shadow-indigo-500/10"
                            title="Lộ trình cá nhân hóa" 
                            desc="Dựa trên thời gian rảnh, lịch bận và ngày thi, SemiPlan tạo lộ trình tối ưu dành riêng cho bạn." 
                        />
                        <FeatureCard 
                            icon={<TrendingUp className="w-7 h-7 text-[#0ea5e9]" />} bg="bg-sky-50" border="border-sky-100" shadow="shadow-sky-500/10"
                            title="Theo dõi tiến độ" 
                            desc="Theo dõi tiến độ từng môn học theo thời gian thực để biết bạn đang ở đâu trên hành trình." 
                        />
                        <FeatureCard 
                            icon={<ShieldCheck className="w-7 h-7 text-[#f43f5e]" />} bg="bg-rose-50" border="border-rose-100" shadow="shadow-rose-500/10"
                            title="Cảnh báo & Nhắc nhở" 
                            desc="Khi có nguy cơ không hoàn thành môn học, SemiPlan sẽ cảnh báo sớm để bạn kịp điều chỉnh." 
                        />
                        <FeatureCard 
                            icon={<Calendar className="w-7 h-7 text-[#f59e0b]" />} bg="bg-amber-50" border="border-amber-100" shadow="shadow-amber-500/10"
                            title="Tự động điều chỉnh" 
                            desc="Nếu bạn bỏ lỡ buổi học, SemiPlan sẽ tự động điều chỉnh lịch để bạn không bị tụt lại phía sau." 
                        />
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS: PREMIUM AI DEMO PURE UI ── */}
            <section id="how-it-works" className="py-24 bg-gradient-to-b from-[#fafafc] to-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 text-purple-700 font-bold text-sm mb-6 shadow-sm">
                            <Crown className="w-4 h-4" /> Premium Demo
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">AI phân tích syllabus đỉnh cao</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Upload file ➔ Nhận diện chủ đề/deadline ➔ Tạo nội dung & nhiệm vụ tự động</p>
                    </div>

                    {/* Flowchart UI purely with Tailwind */}
                    <div className="relative max-w-6xl mx-auto mt-12 bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-100 border border-slate-100">
                        {/* Connecting Line */}
                        <div className="hidden lg:block absolute top-[130px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-indigo-100 via-purple-200 to-indigo-100 rounded-full"></div>
                        
                        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xl mb-6 shadow-lg shadow-indigo-600/30 ring-4 ring-white z-10">1</div>
                                <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-200 text-center hover:shadow-xl transition-shadow group">
                                    <h3 className="font-bold text-slate-800 mb-4">Upload syllabus</h3>
                                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                                        <UploadCloud className="w-8 h-8 text-indigo-500 mb-1" />
                                        <span className="text-[10px] font-bold text-slate-400">PDF/DOCX</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Tải lên file syllabus của môn học.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-black flex items-center justify-center text-xl mb-6 shadow-lg shadow-purple-600/30 ring-4 ring-white z-10">2</div>
                                <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-200 text-center hover:shadow-xl transition-shadow group">
                                    <h3 className="font-bold text-slate-800 mb-4">AI nhận diện</h3>
                                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                                        <Brain className="w-8 h-8 text-purple-500 mb-1" />
                                        <div className="flex gap-1 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Phân tích chủ đề & mốc thời gian.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-xl mb-6 shadow-lg shadow-sky-500/30 ring-4 ring-white z-10">3</div>
                                <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-200 text-center hover:shadow-xl transition-shadow group">
                                    <h3 className="font-bold text-slate-800 mb-4">Tạo nội dung</h3>
                                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                                        <FileText className="w-8 h-8 text-sky-500 mb-1" />
                                        <div className="w-8 h-1.5 bg-sky-100 rounded mt-1"></div>
                                        <div className="w-6 h-1.5 bg-sky-100 rounded mt-1"></div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Lên danh sách chủ đề và kế hoạch.</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-xl mb-6 shadow-lg shadow-emerald-500/30 ring-4 ring-white z-10">4</div>
                                <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-200 text-center hover:shadow-xl transition-shadow group">
                                    <h3 className="font-bold text-slate-800 mb-4">Lên nhiệm vụ</h3>
                                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform p-3">
                                        <div className="w-full flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-md bg-emerald-500"></div><div className="h-2 w-full bg-slate-100 rounded"></div></div>
                                        <div className="w-full flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-md bg-emerald-500"></div><div className="h-2 w-full bg-slate-100 rounded"></div></div>
                                        <div className="w-full flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-slate-200"></div><div className="h-2 w-full bg-slate-100 rounded"></div></div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Phân chia task học, ưu tiên deadline.</p>
                                </div>
                            </div>
                        </div>

                        {/* Banner bottom */}
                        <div className="mt-12 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl shadow-indigo-900/20">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="p-3 bg-white/10 rounded-xl"><Sparkles className="w-6 h-6 text-yellow-300" /></div>
                                <div>
                                    <h4 className="font-bold text-xl">Biến syllabus thành kế hoạch rõ ràng</h4>
                                    <p className="text-indigo-200 text-sm font-medium mt-1">Tiết kiệm hàng giờ đồng hồ mỗi khi bắt đầu kỳ học mới.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">Premium 49.000đ/tháng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ABOUT US PURE UI ── */}
            <section id="about" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-bold text-sm mb-6">
                            <Users className="w-4 h-4" /> Câu chuyện của team
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">Tại sao tụi mình xây SemiPlan?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Tụi mình đều từng "học dồn trước thi". Không phải vì lười — mà vì không có công cụ nào giúp lên kế hoạch thực sự tốt.</p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-xl relative overflow-hidden">
                            {/* Decorative paths */}
                            <svg className="absolute left-0 top-1/2 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none" viewBox="0 0 1000 200"><path d="M0,100 C300,200 700,0 1000,100" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="10 10" /></svg>
                            
                            <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                                {/* Problem boxes */}
                                <div className="flex flex-col gap-4 w-full md:w-1/3">
                                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-slate-600 flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-red-400"></div> Học dồn trước thi</div>
                                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-slate-600 flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Không biết ưu tiên gì</div>
                                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 font-bold text-slate-600 flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Lịch tự vỡ mỗi tuần</div>
                                </div>
                                
                                {/* Solution */}
                                <div className="flex-1 flex flex-col items-center">
                                    <ArrowRight className="w-8 h-8 text-indigo-300 rotate-90 md:rotate-0 mb-6 md:mb-0" />
                                </div>

                                {/* Goal */}
                                <div className="w-full md:w-2/5">
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/30 text-center transform hover:scale-105 transition-transform">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                            <Brain className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-black mb-2">AI lập lịch học cá nhân hóa</h3>
                                        <p className="text-indigo-100 font-medium text-sm">Tự động hóa hoàn toàn từ syllabus của bạn. Giảm tải stress, tập trung học tập.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
                                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                                    <div className="text-4xl font-black text-indigo-600 mb-2">3</div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Thành viên team</div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                                    <div className="text-4xl font-black text-purple-600 mb-2">4+</div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tháng nghiên cứu</div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                                    <div className="text-4xl font-black text-sky-500 mb-2">47</div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sinh viên phỏng vấn</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-slate-900 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
                    <div className="grid md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                                <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-black text-white">SemiPlan</span>
                            </div>
                            <p className="text-slate-400 max-w-sm mx-auto md:mx-0 font-medium leading-relaxed">
                                Trao quyền cho sinh viên chinh phục mục tiêu học tập qua công nghệ AI lập kế hoạch thông minh.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Sản phẩm</h4>
                            <ul className="space-y-4 text-slate-400 text-sm font-medium">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Tính năng</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Bảng giá</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Đánh giá</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Công ty</h4>
                            <ul className="space-y-4 text-slate-400 text-sm font-medium">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Về chúng tôi</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Liên hệ</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 text-center text-slate-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} SemiPlan. Designed with ❤️ for students.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ── Components ── //

function FeatureCard({ icon, bg, border, shadow, title, desc }: { icon: React.ReactNode, bg: string, border: string, shadow: string, title: string, desc: string }) {
    return (
        <div className={`bg-white p-8 rounded-[2rem] border ${border} shadow-xl ${shadow} hover:-translate-y-2 transition-transform duration-300`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${bg}`}>
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function Crown(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.5.5 0 0 1 .478.362l.38 1.333a2.5 2.5 0 0 0 1.717 1.717l1.333.38a.5.5 0 0 1 0 .956l-1.333.38a2.5 2.5 0 0 0-1.717 1.717l-.38 1.333a.5.5 0 0 1-.956 0l-.38-1.333a2.5 2.5 0 0 0-1.717-1.717l-1.333-.38a.5.5 0 0 1 0-.956l1.333-.38a2.5 2.5 0 0 0 1.717-1.717l.38-1.333A.5.5 0 0 1 18 1.5Zm-9 15a.5.5 0 0 1 .478.362l.38 1.333a2.5 2.5 0 0 0 1.717 1.717l1.333.38a.5.5 0 0 1 0 .956l-1.333.38a2.5 2.5 0 0 0-1.717 1.717l-.38 1.333a.5.5 0 0 1-.956 0l-.38-1.333a2.5 2.5 0 0 0-1.717-1.717l-1.333-.38a.5.5 0 0 1 0-.956l1.333-.38a2.5 2.5 0 0 0 1.717-1.717l.38-1.333A.5.5 0 0 1 9 16.5Z" clipRule="evenodd" />
        </svg>
    )
}
