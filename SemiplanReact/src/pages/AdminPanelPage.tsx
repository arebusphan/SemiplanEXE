import { useEffect, useState, useMemo } from "react";
import { 
    getAdminDashboard, 
    getAdminAllPayments, adminApprovePayment,
    getAdminAllUsers, adminUpdateUser, adminDeleteUser
} from "../api/api";
import {
    ShieldCheck, Users, Crown, BookOpen, CalendarDays, ClipboardList,
    Wallet, TrendingUp, GraduationCap, Sparkles, Bot, Clock,
    CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, ArrowDownRight,
    CreditCard, Trash2, UserCog, Search, LayoutDashboard
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import type { PremiumPayment } from "../types";

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

interface AdminUser {
    id: number;
    name: string;
    email: string;
    major: string;
    university: string;
    role: string;
    isPremium: boolean;
    createdAt: string;
}

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];
const BAR_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#8b5cf6", "#a78bfa"];

type Tab = "dashboard" | "payments" | "users";

export default function AdminPanelPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [tab, setTab] = useState<Tab>("dashboard");

    // -- Dashboard State --
    const [data, setData] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    // -- Payments State --
    const [allPayments, setAllPayments] = useState<PremiumPayment[]>([]);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState<"pending" | "all">("pending");

    // -- Users State --
    const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        if (user && user.role !== "admin") { navigate("/"); return; }
        getAdminDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
        fetchPayments();
        fetchUsers();
    }, [user, navigate]);

    const fetchPayments = async () => {
        setPaymentLoading(true);
        try { setAllPayments(await getAdminAllPayments()); }
        catch (e) { console.error(e); }
        finally { setPaymentLoading(false); }
    };

    const fetchUsers = async () => {
        setUserLoading(true);
        try { setAllUsers(await getAdminAllUsers()); }
        catch (e) { console.error(e); }
        finally { setUserLoading(false); }
    };

    // Dashboard calculations
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

    // Payment and user lists
    const displayedPayments = useMemo(() =>
        paymentFilter === "pending" ? allPayments.filter(p => p.status === "Pending") : allPayments,
        [allPayments, paymentFilter]);

    const filteredUsers = useMemo(() => {
        const q = userSearch.toLowerCase();
        return allUsers.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.university.toLowerCase().includes(q)
        );
    }, [allUsers, userSearch]);

    const handlePaymentAction = async (id: number, approve: boolean) => {
        try { await adminApprovePayment(id, approve); fetchPayments(); }
        catch { alert("Failed to process action."); }
    };

    const handleToggleRole = async (u: AdminUser) => {
        setActionLoading(u.id);
        try {
            const newRole = u.role === "admin" ? "user" : "admin";
            await adminUpdateUser(u.id, { role: newRole, isPremium: u.isPremium });
            setAllUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
        } catch { alert("Failed to update role."); }
        finally { setActionLoading(null); }
    };

    const handleTogglePremium = async (u: AdminUser) => {
        setActionLoading(u.id);
        try {
            await adminUpdateUser(u.id, { role: u.role, isPremium: !u.isPremium });
            setAllUsers(prev => prev.map(x => x.id === u.id ? { ...x, isPremium: !x.isPremium } : x));
        } catch { alert("Failed to update premium."); }
        finally { setActionLoading(null); }
    };

    const handleDeleteUser = async (id: number) => {
        setActionLoading(id);
        try {
            await adminDeleteUser(id);
            setAllUsers(prev => prev.filter(x => x.id !== id));
            setDeleteConfirm(null);
        } catch { alert("Failed to delete user."); }
        finally { setActionLoading(null); }
    };

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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
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
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 w-fit border border-slate-200">
                <button
                    onClick={() => setTab("dashboard")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${tab === "dashboard" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Overview
                </button>
                <button
                    onClick={() => setTab("users")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${tab === "users" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                    <UserCog className="w-4 h-4" /> User Management
                </button>
                <button
                    onClick={() => setTab("payments")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${tab === "payments" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                >
                    <CreditCard className="w-4 h-4" /> Payment Management
                </button>
            </div>

            {tab === "dashboard" && (
                <>
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <GradientCard 
                            icon={<Users className="w-6 h-6 text-white" />} 
                            label="Total Users" value={data.totalUsers} sub={`${data.newUsersThisMonth} new this month`}
                            from="from-blue-500" to="to-indigo-600" shadow="shadow-blue-500/30" growth={userGrowthPercent}
                        />
                        <GradientCard 
                            icon={<Wallet className="w-6 h-6 text-white" />} 
                            label="Total Revenue" value={`${(data.totalRevenue / 1000).toFixed(0)}k`} sub={`VND This Month: ${(data.revenueThisMonth/1000).toFixed(0)}k`}
                            from="from-emerald-400" to="to-emerald-600" shadow="shadow-emerald-500/30" growth={revenueGrowthPercent}
                        />
                        <GradientCard 
                            icon={<BookOpen className="w-6 h-6 text-white" />} 
                            label="Subjects Created" value={data.totalSubjects} sub={`${data.completedSubjects} completed`}
                            from="from-amber-400" to="to-orange-500" shadow="shadow-orange-500/30"
                        />
                        <GradientCard 
                            icon={<CalendarDays className="w-6 h-6 text-white" />} 
                            label="Schedules" value={data.totalSchedules} sub={`${data.aiGeneratedSchedules} generated by AI`}
                            from="from-purple-500" to="to-fuchsia-600" shadow="shadow-purple-500/30"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Main Chart - User Growth */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">User Growth</h3>
                                    <p className="text-slate-500 text-sm">Monthly new user registrations</p>
                                </div>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                        <RTooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                            itemStyle={{color: '#6366f1', fontWeight: 'bold'}}
                                        />
                                        <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart - Premium vs Free */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-slate-800">User Plan Distribution</h3>
                            </div>
                            <div className="flex-1 flex flex-col justify-center relative">
                                <div className="h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RTooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Center text overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-slate-800">{premiumRate}%</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Premium</span>
                                </div>
                                <div className="flex justify-center gap-6 mt-4">
                                    <LegendDot color="bg-indigo-500" label="Premium" value={data.premiumUsers} />
                                    <LegendDot color="bg-green-500" label="Free" value={data.freeUsers} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {tab === "users" && (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800">User Management</h3>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or university..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    {userLoading ? <Spinner /> : filteredUsers.length === 0 ? (
                        <Empty icon={<Users />} title="No users found" sub="Try a different search term." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                        <th className="pb-3 font-semibold">User</th>
                                        <th className="pb-3 font-semibold">University / Major</th>
                                        <th className="pb-3 font-semibold">Joined</th>
                                        <th className="pb-3 font-semibold">Role</th>
                                        <th className="pb-3 font-semibold">Premium</th>
                                        <th className="pb-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4">
                                                <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </td>
                                            <td className="py-4">
                                                <p className="text-sm text-slate-700">{u.university}</p>
                                                <p className="text-xs text-slate-500">{u.major}</p>
                                            </td>
                                            <td className="py-4 text-sm text-slate-600">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => handleToggleRole(u)}
                                                    disabled={actionLoading === u.id}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${u.role === "admin"
                                                        ? "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                                        }`}
                                                    title="Click to toggle role"
                                                >
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    {u.role === "admin" ? "Admin" : "User"}
                                                </button>
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => handleTogglePremium(u)}
                                                    disabled={actionLoading === u.id}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${u.isPremium
                                                        ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                                        }`}
                                                    title="Click to toggle premium"
                                                >
                                                    <Crown className="w-3.5 h-3.5" />
                                                    {u.isPremium ? "Premium" : "Free"}
                                                </button>
                                            </td>
                                            <td className="py-4 text-right">
                                                {deleteConfirm === u.id ? (
                                                    <div className="flex justify-end items-center gap-2">
                                                        <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                                            <AlertTriangle className="w-3.5 h-3.5" /> Sure?
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            disabled={actionLoading === u.id}
                                                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(u.id)}
                                                        className="p-2 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === "payments" && (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Payment Management</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPaymentFilter("pending")}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${paymentFilter === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                            >
                                Pending ({allPayments.filter(p => p.status === "Pending").length})
                            </button>
                            <button
                                onClick={() => setPaymentFilter("all")}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${paymentFilter === "all" ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                            >
                                All History
                            </button>
                        </div>
                    </div>
                    
                    {paymentLoading ? <Spinner /> : displayedPayments.length === 0 ? (
                        <Empty icon={<ShieldCheck />} title="No payments found" sub={`No ${paymentFilter} requests at the moment.`} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                        <th className="pb-3 font-semibold">User</th>
                                        <th className="pb-3 font-semibold">Amount</th>
                                        <th className="pb-3 font-semibold">Transaction</th>
                                        <th className="pb-3 font-semibold">Date</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedPayments.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4">
                                                <p className="font-bold text-slate-800 text-sm">{p.userName}</p>
                                                <p className="text-xs text-slate-500">{p.userEmail}</p>
                                            </td>
                                            <td className="py-4 font-semibold text-slate-700 text-sm">{p.amount.toLocaleString()} VND</td>
                                            <td className="py-4">
                                                <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{p.transactionInfo}</span>
                                            </td>
                                            <td className="py-4 text-sm text-slate-600">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                {p.status === "Pending" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-600 border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                                                {p.status === "Approved" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>}
                                                {p.status === "Rejected" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
                                            </td>
                                            <td className="py-4 text-right">
                                                {p.status === "Pending" ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handlePaymentAction(p.id, true)} className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors" title="Approve">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handlePaymentAction(p.id, false)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors" title="Reject">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
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

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm text-slate-600 font-medium">{label}: <strong>{value}</strong></span>
        </div>
    );
}

function Spinner() {
    return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );
}

function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
    return (
        <div className="text-center py-12">
            <div className="w-12 h-12 text-slate-300 mx-auto mb-3 flex items-center justify-center">{icon}</div>
            <p className="text-lg font-bold text-slate-700">{title}</p>
            <p className="text-slate-500 text-sm">{sub}</p>
        </div>
    );
}
