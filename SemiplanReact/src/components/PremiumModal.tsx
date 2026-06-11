import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, Sparkles, ShieldCheck, CreditCard, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { createPayOsPayment, getPayOsPaymentStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type PaymentState = 'idle' | 'creating' | 'redirecting' | 'pending' | 'approved' | 'cancelled' | 'error';

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { user, refreshUser } = useAuth();
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [error, setError] = useState('');
    const [checkoutUrl, setCheckoutUrl] = useState('');

    // Check payment status on open
    const checkStatus = useCallback(async () => {
        try {
            const data = await getPayOsPaymentStatus();
            if (data) {
                if (data.status === 'Approved' || data.isPremium) {
                    setPaymentState('approved');
                    if (!user?.isPremium) {
                        await refreshUser();
                    }
                } else if (data.status === 'Pending') {
                    setPaymentState('pending');
                } else if (data.status === 'Cancelled') {
                    setPaymentState('idle'); // Allow retry
                }
            }
        } catch (err) {
            console.error(err);
        }
    }, [user, refreshUser]);

    useEffect(() => {
        if (isOpen && user) {
            if (user.isPremium) {
                setPaymentState('approved');
            } else {
                checkStatus();
            }
        }
    }, [isOpen, user, checkStatus]);

    // Auto-poll payment status when in pending state
    useEffect(() => {
        if (paymentState !== 'pending') return;
        
        const interval = setInterval(async () => {
            try {
                const data = await getPayOsPaymentStatus();
                if (data?.status === 'Approved' || data?.isPremium) {
                    setPaymentState('approved');
                    await refreshUser();
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [paymentState, refreshUser]);

    const handleUpgrade = async () => {
        setPaymentState('creating');
        setError('');
        try {
            const currentUrl = window.location.origin;
            const result = await createPayOsPayment(
                `${currentUrl}/dashboard?payment=success`,
                `${currentUrl}/dashboard?payment=cancel`
            );

            if (result.checkoutUrl) {
                setCheckoutUrl(result.checkoutUrl);
                setPaymentState('redirecting');
                // Open PayOS checkout in new tab
                window.open(result.checkoutUrl, '_blank');
                // Set state to pending so we auto-poll
                setTimeout(() => setPaymentState('pending'), 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.');
            setPaymentState('error');
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

                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Nâng cấp Premium</h2>
                    <p className="text-center text-slate-500 mb-8">Mở khóa toàn bộ tính năng AI và tăng hiệu quả học tập.</p>

                    {/* ── APPROVED STATE ── */}
                    {paymentState === 'approved' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-800 mb-2">Bạn đã là Premium! 👑</h3>
                            <p className="text-sm text-emerald-600 mb-4">Cảm ơn bạn đã nâng cấp. Tất cả tính năng đã được mở khóa.</p>
                            <button onClick={onClose} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                                Bắt đầu học
                            </button>
                        </div>
                    )}

                    {/* ── PENDING STATE (after payment, waiting for webhook) ── */}
                    {paymentState === 'pending' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-amber-800 mb-2">Đang xác nhận thanh toán...</h3>
                            <p className="text-sm text-amber-600 mb-4">
                                Hệ thống đang tự động xác nhận thanh toán của bạn. Vui lòng đợi trong giây lát.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-amber-700 mb-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm font-medium">Đang kiểm tra tự động...</span>
                            </div>
                            {checkoutUrl && (
                                <a 
                                    href={checkoutUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-amber-700 font-semibold text-sm hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" /> Mở lại trang thanh toán
                                </a>
                            )}
                            <button
                                onClick={checkStatus}
                                className="mt-3 flex items-center gap-2 mx-auto text-amber-700 font-semibold text-sm hover:underline"
                            >
                                <RefreshCw className="w-4 h-4" /> Kiểm tra thủ công
                            </button>
                        </div>
                    )}

                    {/* ── REDIRECTING STATE ── */}
                    {paymentState === 'redirecting' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-blue-800 mb-2">Đang chuyển đến PayOS...</h3>
                            <p className="text-sm text-blue-600 mb-4">Cửa sổ thanh toán đã mở. Hoàn tất thanh toán để kích hoạt Premium.</p>
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                        </div>
                    )}

                    {/* ── CREATING STATE ── */}
                    {paymentState === 'creating' && (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">Đang tạo link thanh toán...</p>
                        </div>
                    )}

                    {/* ── IDLE / ERROR STATE (show upgrade CTA) ── */}
                    {(paymentState === 'idle' || paymentState === 'error') && (
                        <div className="space-y-6">
                            <ul className="space-y-3">
                                {[
                                    'AI Study Sessions không giới hạn',
                                    'Phân tích đề cương nâng cao',
                                    'Hỗ trợ ưu tiên',
                                    'Trải nghiệm không quảng cáo'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="font-medium text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-black text-slate-800">49,000</span>
                                    <span className="text-lg font-bold text-slate-500">VND</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">Thanh toán một lần • Trọn đời</p>
                                <div className="flex items-center gap-2 mb-5">
                                    <CreditCard className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-semibold text-indigo-600">Thanh toán tự động qua PayOS</span>
                                </div>

                                {error && <p className="text-red-500 text-sm font-medium mb-3 text-center">{error}</p>}

                                <button 
                                    onClick={handleUpgrade}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Thanh toán ngay
                                </button>
                                <p className="text-xs text-slate-400 mt-3 text-center">Bạn sẽ được chuyển đến trang thanh toán bảo mật của PayOS</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
