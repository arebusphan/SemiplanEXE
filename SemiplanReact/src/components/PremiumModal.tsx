import { useState, useEffect } from 'react';
import { X, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { submitPremiumRequest, getPremiumStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            checkStatus();
        }
    }, [isOpen, user]);

    const checkStatus = async () => {
        try {
            const data = await getPremiumStatus();
            if (data) {
                setStatus(data.status);
                if (data.status === 'Approved' && !user?.isPremium) {
                    await refreshUser();
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpgrade = async () => {
        setLoading(true);
        setError('');
        try {
            await submitPremiumRequest("SEMIPLAN_PREMIUM");
            setStatus('Pending');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-8 w-[480px] shadow-2xl relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-400 to-orange-500 opacity-10" />
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Upgrade to Premium</h2>
                    <p className="text-center text-slate-500 mb-8">Unlock AI-generated study lessons and boost your productivity.</p>

                    {status === 'Pending' ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-amber-800 mb-2">Payment Pending</h3>
                            <p className="text-sm text-amber-600 mb-4">We are verifying your payment. This usually takes a few minutes.</p>
                            <button onClick={checkStatus} className="text-amber-700 font-semibold text-sm hover:underline">
                                Refresh Status
                            </button>
                        </div>
                    ) : status === 'Approved' ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-800 mb-2">You are Premium!</h3>
                            <p className="text-sm text-emerald-600 mb-4">Thank you for upgrading. All features are now unlocked.</p>
                            <button onClick={onClose} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700">
                                Start Studying
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <ul className="space-y-3">
                                {[
                                    'Unlimited AI Study Sessions',
                                    'Advanced Syllabus Analysis',
                                    'Priority support',
                                    'Ad-free experience'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="font-medium text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
                                <p className="text-sm font-bold text-slate-700 mb-4">Scan to pay: <span className="text-primary-600 text-lg">49,000 VND</span></p>
                                <img
                                    src="https://img.vietqr.io/image/ICB-100876624380-compact.png?amount=49000&addInfo=SEMIPLAN_PREMIUM"
                                    alt="Thanh toán Premium"
                                    className="w-48 h-48 bg-white rounded-xl shadow-sm border border-slate-200 mb-4"
                                />
                                <p className="text-xs text-slate-500 text-center mb-4">Include transfer note: <strong className="text-slate-700">SEMIPLAN_PREMIUM</strong></p>
                                
                                {error && <p className="text-red-500 text-sm font-medium mb-3 text-center">{error}</p>}

                                <button 
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'I have paid'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
