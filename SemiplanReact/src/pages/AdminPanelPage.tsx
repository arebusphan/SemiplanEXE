import { useEffect, useState, useMemo } from "react";
import { getAdminAllPayments, adminApprovePayment } from "../api/api";
import { ShieldCheck, CheckCircle2, XCircle, Clock, Wallet, Banknote, Users } from "lucide-react";
import type { PremiumPayment } from "../types";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminPanelPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allPayments, setAllPayments] = useState<PremiumPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');

    const stats = useMemo(() => {
        const approved = allPayments.filter(p => p.status === 'Approved');
        const pending = allPayments.filter(p => p.status === 'Pending');
        const totalRevenue = approved.reduce((sum, p) => sum + p.amount, 0);
        return {
            totalRevenue,
            approvedCount: approved.length,
            pendingCount: pending.length
        };
    }, [allPayments]);

    const displayedPayments = useMemo(() => {
        if (filter === 'pending') return allPayments.filter(p => p.status === 'Pending');
        return allPayments;
    }, [allPayments, filter]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, filter, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAdminAllPayments();
            setAllPayments(data);
        } catch (error) {
            console.error("Failed to fetch payments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, approve: boolean) => {
        try {
            await adminApprovePayment(id, approve);
            // Refresh list
            fetchData();
        } catch (error) {
            console.error("Action failed", error);
            alert("Failed to process action.");
        }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500">Manage revenue and premium subscriptions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/25 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full" />
                    <h3 className="font-bold text-emerald-100 flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5" /> Total Revenue
                    </h3>
                    <p className="text-4xl font-black">{stats.totalRevenue.toLocaleString()} <span className="text-lg">VND</span></p>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Premium Users</p>
                        <p className="text-3xl font-black text-slate-800">{stats.approvedCount}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Requests</p>
                        <p className="text-3xl font-black text-slate-800">{stats.pendingCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200/60 p-4 flex gap-2 bg-slate-50">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        All History
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : displayedPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-lg font-bold text-slate-700">No payments found</p>
                            <p className="text-slate-500">There are no {filter} payment requests at the moment.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                                        <th className="pb-3 font-semibold">User</th>
                                        <th className="pb-3 font-semibold">Amount</th>
                                        <th className="pb-3 font-semibold">Note / Trans. Info</th>
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
                                            <td className="py-4">
                                                <span className="font-semibold text-slate-700">{p.amount.toLocaleString()} VND</span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{p.transactionInfo}</span>
                                            </td>
                                            <td className="py-4 text-sm text-slate-600">
                                                {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4">
                                                {p.status === 'Pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                                                {p.status === 'Approved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>}
                                                {p.status === 'Rejected' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
                                            </td>
                                            <td className="py-4 text-right">
                                                {p.status === 'Pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleAction(p.id, true)}
                                                            className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(p.id, false)}
                                                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
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
        </div>
    );
}
