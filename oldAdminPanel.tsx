import { useEffect, useState, useMemo } from "react";
import {
    getAdminAllPayments, adminApprovePayment,
    getAdminAllUsers, adminUpdateUser, adminDeleteUser,
} from "../api/api";
import {
    ShieldCheck, CheckCircle2, XCircle, Clock, Wallet, Users,
    CreditCard, Trash2, Crown, UserCog, Search, AlertTriangle,
} from "lucide-react";
import type { PremiumPayment } from "../types";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

type Tab = "payments" | "users";

export default function AdminPanelPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ΓöÇΓöÇ shared ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const [tab, setTab] = useState<Tab>("payments");

    // ΓöÇΓöÇ payments state ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const [allPayments, setAllPayments] = useState<PremiumPayment[]>([]);
    const [paymentLoading, setPaymentLoading] = useState(true);
    const [paymentFilter, setPaymentFilter] = useState<"pending" | "all">("pending");

    // ΓöÇΓöÇ users state ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // ΓöÇΓöÇ stats ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const stats = useMemo(() => {
        const approved = allPayments.filter(p => p.status === "Approved");
        const pending = allPayments.filter(p => p.status === "Pending");
        return {
            totalRevenue: approved.reduce((s, p) => s + p.amount, 0),
            approvedCount: approved.length,
            pendingCount: pending.length,
            totalUsers: allUsers.length,
            premiumUsers: allUsers.filter(u => u.isPremium).length,
        };
    }, [allPayments, allUsers]);

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

    useEffect(() => {
        if (user && user.role !== "admin") { navigate("/"); return; }
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

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500">Manage users, revenue and premium subscriptions</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white shadow-lg shadow-emerald-500/25 col-span-2 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-bl-full" />
                    <h3 className="font-bold text-emerald-100 flex items-center gap-2 mb-1 text-sm">
                        <Wallet className="w-4 h-4" /> Total Revenue
                    </h3>
                    <p className="text-3xl font-black">{stats.totalRevenue.toLocaleString()} <span className="text-base">VND</span></p>
                </div>
                <StatCard icon={<Users className="w-6 h-6" />} color="blue" label="Total Users" value={stats.totalUsers} />
                <StatCard icon={<Crown className="w-6 h-6" />} color="amber" label="Premium" value={stats.premiumUsers} />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200/60 p-3 flex gap-2 bg-slate-50">
                    <TabBtn active={tab === "payments"} onClick={() => setTab("payments")} icon={<CreditCard className="w-4 h-4" />} label="Payment Management" />
                    <TabBtn active={tab === "users"} onClick={() => setTab("users")} icon={<UserCog className="w-4 h-4" />} label="User Management" />
                </div>

                {/* ΓöÇΓöÇ PAYMENT TAB ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
                {tab === "payments" && (
                    <div>
                        <div className="border-b border-slate-100 px-6 pt-4 pb-0 flex gap-2">
                            <SubTabBtn active={paymentFilter === "pending"} onClick={() => setPaymentFilter("pending")} label={`Pending (${stats.pendingCount})`} />
                            <SubTabBtn active={paymentFilter === "all"} onClick={() => setPaymentFilter("all")} label="All History" />
                        </div>
                        <div className="p-6">
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
                                                        {p.status === "Pending" && <Badge color="amber" icon={<Clock className="w-3.5 h-3.5" />} label="Pending" />}
                                                        {p.status === "Approved" && <Badge color="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Approved" />}
                                                        {p.status === "Rejected" && <Badge color="red" icon={<XCircle className="w-3.5 h-3.5" />} label="Rejected" />}
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
                    </div>
                )}

                {/* ΓöÇΓöÇ USER TAB ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
                {tab === "users" && (
                    <div className="p-6">
                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or university..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
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
            </div>
        </div>
    );
}

/* ΓöÇΓöÇ Small helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

function StatCard({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: number }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
    };
    return (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"}`}
        >
            {icon}{label}
        </button>
    );
}

function SubTabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-t-xl text-sm font-bold transition-colors border-b-2 ${active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
            {label}
        </button>
    );
}

function Badge({ color, icon, label }: { color: string; icon: React.ReactNode; label: string }) {
    const map: Record<string, string> = {
        amber: "bg-amber-50 text-amber-600 border-amber-200",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
        red: "bg-red-50 text-red-600 border-red-200",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${map[color]}`}>
            {icon}{label}
        </span>
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
