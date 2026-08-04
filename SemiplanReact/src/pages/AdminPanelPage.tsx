import { useEffect, useState, useMemo } from "react";
import { getAdminDashboard } from "../api/api";
import {
    ShieldCheck, Users, Crown, BookOpen, CalendarDays, ClipboardList,
    Wallet, TrendingUp, GraduationCap, Sparkles, Bot, Clock,
    CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";

interface AdminDashboard {
    totalUsers: number; premiumUsers: number; freeUsers: number; adminUsers: number;
    newUsersThisMonth: number; newUsersLastMonth: number;
    totalSubjects: number; activeSubjects: number; completedSubjects: number; totalChapters: number;
    totalSchedules: number; completedSchedules: number; pendingSchedules: number;
    missedSchedules: number; aiGeneratedSchedules: number;
    totalAssignments: number; completedAssignments: number; pendingAssignments: number;
    totalRevenue: number; totalPayments: number; approvedPayments: number;
    pendingPayments: number; rejectedPayments: number;
    revenueThisMonth: number; revenueLastMonth: number;
    userGrowthData: { month: string; users: number }[];
    topUniversities: { university: string; count: number }[];
    recentUsers: { id: number; name: string; email: string; university: string; isPremium: boolean; createdAt: string }[];
    monthlyRevenueData: { month: string; revenue: number; count: number }[];
}

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];
const BAR_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#8b5cf6", "#a78bfa"];

export default function AdminPanelPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== "admin") { navigate("/"); return; }
        getAdminDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
    }, [user, navigate]);

    const userGrowthPercent = useMemo(() => {
        if (!data) return 0;
        if (data.newUsersLastMonth === 0) return data.newUsersThisMonth > 0 ? 100 : 0;
        return Math.round(((data.newUsersThisMonth - data.newUsersLastMonth) / data.newUsersLastMonth) * 100);
    }, [data]);

    const revenueGrowthPercent = useMemo(() => {
        if (!data) return 0;
        if (data.revenueLastMonth === 0) return data.revenueThisMonth > 0 ? 100 : 0;
        return Math.round(((data.revenueThisMonth - data.revenueLastMonth) / data.revenueLastMonth) * 100);
    }, [data]);

    const scheduleCompletionRate = useMemo(() => {
        if (!data || data.totalSchedules === 0) return 0;
        return Math.round((data.completedSchedules / data.totalSchedules) * 100);
    }, [data]);

    const premiumRate = useMemo(() => {
        if (!data || data.totalUsers === 0) return 0;
        return Math.round((data.premiumUsers / data.totalUsers) * 100);
    }, [data]);

    if (!user || user.role !== "admin") return null;
    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );
    if (!data) return <div className="text-center py-20 text-slate-500">Failed to load dashboard.</div>;

    const pieData = [
        { name: "Premium", value: data.premiumUsers },
        { name: "Free", value: data.freeUsers },
    ];

    const schedPieData = [
        { name: "Completed", value: data.completedSchedules, color: "#22c55e" },
        { name: "Pending", value: data.pendingSchedules, color: "#f59e0b" },
        { name: "Missed", value: data.missedSchedules, color: "#ef4444" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto pb-20 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 border border-indigo-100">
                        <Sparkles className="w-3 h-3" /> System Overview
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
                </div>
            </div>

            {/* ── TOP STATS ROW ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <GradientCard icon={<Users className="w-7 h-7" />} label="Total Users" value={data.totalUsers}
                    sub={`+${data.newUsersThisMonth} this month`} from="from-blue-500" to="to-cyan-500" shadow="shadow-blue-500/25"
                    growth={userGrowthPercent} />
                <GradientCard icon={<Crown className="w-7 h-7" />} label="Premium Users" value={data.premiumUsers}
                    sub={`${premiumRate}% conversion`} from="from-amber-400" to="to-orange-500" shadow="shadow-orange-500/25" />
                <GradientCard icon={<Wallet className="w-7 h-7" />} label="Total Revenue" value={`${data.totalRevenue.toLocaleString()}₫`}
                    sub={`+${data.revenueThisMonth.toLocaleString()}₫ this month`} from="from-emerald-500" to="to-green-600" shadow="shadow-emerald-500/25"
                    growth={revenueGrowthPercent} />
                <GradientCard icon={<Bot className="w-7 h-7" />} label="AI Schedules" value={data.aiGeneratedSchedules}
                    sub={`of ${data.totalSchedules} total`} from="from-purple-500" to="to-indigo-600" shadow="shadow-purple-500/25" />
            </div>

            {/* ── CHARTS ROW 1 ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                {/* User Growth Chart */}
                <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" /> User Growth
                            </h2>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">New registrations over 6 months</p>
                        </div>
                    </div>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="ugFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} allowDecimals={false} />
                                <RTooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fill="url(#ugFill)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Breakdown Pie */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 flex flex-col">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-indigo-500" /> User Breakdown
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mb-4">Premium vs Free users</p>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                </Pie>
                                <RTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 15px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                        <LegendDot color="bg-indigo-500" label="Premium" value={data.premiumUsers} />
                        <LegendDot color="bg-emerald-500" label="Free" value={data.freeUsers} />
                    </div>
                </div>
            </div>

            {/* ── SECONDARY STATS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MiniCard icon={<BookOpen className="w-5 h-5" />} color="blue" label="Subjects" value={data.totalSubjects} sub={`${data.activeSubjects} active`} />
                <MiniCard icon={<GraduationCap className="w-5 h-5" />} color="purple" label="Chapters" value={data.totalChapters} />
                <MiniCard icon={<CalendarDays className="w-5 h-5" />} color="emerald" label="Schedules" value={data.totalSchedules} sub={`${scheduleCompletionRate}% done`} />
                <MiniCard icon={<ClipboardList className="w-5 h-5" />} color="amber" label="Assignments" value={data.totalAssignments} sub={`${data.completedAssignments} completed`} />
            </div>

            {/* ── CHARTS ROW 2 ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-1">
                        <Wallet className="w-5 h-5 text-emerald-500" /> Monthly Revenue
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mb-6">Payment income over 6 months (VND)</p>
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                                <RTooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                    formatter={(v: number) => [`${v.toLocaleString()} VND`, 'Revenue']} />
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                                    {data.monthlyRevenueData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Schedule Status Pie + Payment Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-3">
                            <CalendarDays className="w-4 h-4 text-blue-500" /> Schedule Status
                        </h2>
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width={110} height={110}>
                                <PieChart>
                                    <Pie data={schedPieData} cx="50%" cy="50%" innerRadius={32} outerRadius={48} paddingAngle={3} dataKey="value" stroke="none">
                                        {schedPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 flex-1">
                                <SmallStat color="bg-emerald-500" label="Completed" value={data.completedSchedules} />
                                <SmallStat color="bg-amber-500" label="Pending" value={data.pendingSchedules} />
                                <SmallStat color="bg-red-500" label="Missed" value={data.missedSchedules} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-3">
                            <Wallet className="w-4 h-4 text-emerald-500" /> Payment Status
                        </h2>
                        <div className="space-y-2">
                            <SmallStat color="bg-emerald-500" label="Approved" value={data.approvedPayments} />
                            <SmallStat color="bg-amber-500" label="Pending" value={data.pendingPayments} />
                            <SmallStat color="bg-red-500" label="Rejected" value={data.rejectedPayments} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM ROW: Top Universities + Recent Users ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Top Universities */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-6">
                        <GraduationCap className="w-5 h-5 text-purple-500" /> Top Universities
                    </h2>
                    {data.topUniversities.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.topUniversities.map((u, i) => {
                                const max = data.topUniversities[0]?.count || 1;
                                const pct = Math.round((u.count / max) * 100);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold text-slate-700 truncate pr-4">{u.university}</span>
                                            <span className="text-slate-500 font-semibold shrink-0">{u.count} users</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-blue-500" /> Recent Registrations
                    </h2>
                    {data.recentUsers.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No users yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                                        <th className="pb-2 font-semibold">User</th>
                                        <th className="pb-2 font-semibold">University</th>
                                        <th className="pb-2 font-semibold">Status</th>
                                        <th className="pb-2 font-semibold text-right">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.recentUsers.slice(0, 7).map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-2.5">
                                                <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                                <p className="text-[11px] text-slate-400">{u.email}</p>
                                            </td>
                                            <td className="py-2.5 text-xs text-slate-600 font-medium">{u.university}</td>
                                            <td className="py-2.5">
                                                {u.isPremium ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-200">
                                                        <Crown className="w-3 h-3" /> Premium
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200">
                                                        Free
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 text-xs text-slate-500 text-right font-medium">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Helper Components ── */

function GradientCard({ icon, label, value, sub, from, to, shadow, growth }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string;
    from: string; to: string; shadow: string; growth?: number;
}) {
    return (
        <div className={`bg-gradient-to-br ${from} ${to} rounded-3xl p-6 text-white shadow-lg ${shadow} relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
            <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-bl-full" />
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="flex items-start justify-between relative z-10 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">{icon}</div>
                {growth !== undefined && growth !== 0 && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${growth > 0 ? 'bg-white/20' : 'bg-red-400/30'}`}>
                        {growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(growth)}%
                    </span>
                )}
            </div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-black">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-white/70 text-xs font-medium mt-1">{sub}</p>}
        </div>
    );
}

function MiniCard({ icon, color, label, value, sub }: {
    icon: React.ReactNode; color: string; label: string; value: number; sub?: string;
}) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600",
        emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600",
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-slate-800">{value.toLocaleString()}</p>
                {sub && <p className="text-[11px] text-slate-500 font-medium">{sub}</p>}
            </div>
        </div>
    );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm text-slate-600 font-medium">{label}: <strong>{value}</strong></span>
        </div>
    );
}

function SmallStat({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-sm text-slate-600 font-medium">{label}</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{value}</span>
        </div>
    );
}
