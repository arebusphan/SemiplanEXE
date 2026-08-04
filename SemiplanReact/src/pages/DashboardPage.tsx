import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/api';
import PremiumModal from '../components/PremiumModal';
import type { Dashboard } from '../types';
import {
  Sparkles,
  Target, CalendarDays, CheckCircle2,
  Flame, ChevronRight, Clock, BookOpen, Crown, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  useEffect(() => {
    // Check for payment callback params
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success' || paymentStatus === 'cancel') {
        setIsPremiumModalOpen(true);
        // Clean up URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (user) {
      getDashboard()
        .then(data => {
          setDashboard(data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin shadow-lg shadow-primary-500/20" />
      </div>
    );
  }

  // Prepare chart data
  const subjectChartData = dashboard?.subjectProgress?.map(s => ({
    name: s.subjectTitle,
    progress: s.completionPercent,
    hours: s.totalStudyHours,
    color: s.subjectColor || '#3b82f6'
  })) || [];

  // Mock activity data for visual aesthetic (would normally come from API)
  const activityData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.8 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.2 },
    { day: 'Fri', hours: 2.0 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun', hours: dashboard?.totalStudyHours ? Math.min(dashboard.totalStudyHours % 6, 6) : 3.0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up max-w-[1400px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-primary-500/20 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" /> AI Study Assistant Active
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">{user?.name || 'Student'}</span> 👋
          </h1>
          <p className="text-slate-500 text-base font-medium">Ready to conquer your goals today?</p>
        </div>
        {user?.isPremium ? (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl px-6 py-4 text-white shadow-xl shadow-orange-500/30 flex items-center gap-4 animate-fade-in-right transform hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-orange-400/50">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all"></div>
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md relative z-10 shadow-inner">
              <Crown className="w-7 h-7 text-amber-100" />
            </div>
            <div className="relative z-10">
              <h3 className="font-extrabold text-lg leading-tight tracking-wide">Premium Active</h3>
              <p className="text-sm text-orange-50 font-medium opacity-90">Enjoy unlimited AI power</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsPremiumModalOpen(true)}
            className="bg-white rounded-2xl px-6 py-4 text-slate-800 shadow-lg shadow-slate-200/50 flex items-center gap-4 animate-fade-in-right hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group"
          >
            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Crown className="w-7 h-7 text-orange-500" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg leading-tight text-slate-800">Upgrade to Premium</h3>
              <p className="text-sm text-slate-500 font-medium">Unlock full AI scheduling</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
          </button>
        )}
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-150 transition-transform duration-700">
              <BookOpen className="w-24 h-24 text-primary-500" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Subjects</p>
                <p className="text-3xl font-black text-slate-800">{dashboard?.totalSubjects || 0}</p>
              </div>
            </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-150 transition-transform duration-700">
              <Clock className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Study Hours</p>
                <p className="text-3xl font-black text-slate-800">{dashboard?.totalStudyHours || 0}</p>
              </div>
            </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-150 transition-transform duration-700">
              <CheckCircle2 className="w-24 h-24 text-blue-500" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sessions Done</p>
                <p className="text-3xl font-black text-slate-800">{dashboard?.completedSessions || 0}</p>
              </div>
            </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 border border-orange-400/50 shadow-lg shadow-orange-500/30 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 transition-transform duration-700">
              <Flame className="w-24 h-24 text-white" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-100 uppercase tracking-wider mb-0.5">Current Streak</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-white">{dashboard?.currentStreak || 0}</p>
                  <span className="text-orange-100 font-bold text-sm">Days</span>
                </div>
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Charts */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Study Activity Area Chart */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" /> Study Activity
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Your learning hours over the last 7 days</p>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                  <RechartsTooltip 
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Progress Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  Subject Mastery
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Completion percentage across your courses</p>
              </div>
              <button 
                onClick={() => navigate('/subjects')}
                className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {subjectChartData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                      formatter={(value: number) => [`${value}%`, 'Progress']}
                    />
                    <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                      {subjectChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No subjects found.</p>
                  <button onClick={() => navigate('/subjects')} className="mt-3 text-primary-600 font-bold hover:underline">Add your first subject</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Goals, Workload, Readiness */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-7 shadow-xl shadow-primary-500/25 text-white relative overflow-hidden transform transition-all hover:scale-[1.02]">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-bl-[100px] blur-md" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl" />
            <h2 className="font-extrabold text-primary-100 flex items-center gap-2 mb-8 relative z-10 text-lg">
              <Target className="w-6 h-6 text-accent-400" />
              Goal Progress
            </h2>
            
            <div className="flex flex-col items-center justify-center mb-6 relative z-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="url(#progressGradient)" strokeWidth="8" 
                    strokeDasharray="283" strokeDashoffset={283 - (283 * (dashboard?.overallProgress || 0)) / 100}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-primary-100">{dashboard?.overallProgress || 0}%</span>
                  <span className="text-[10px] uppercase tracking-widest text-primary-200 font-bold mt-1">Completed</span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/15 rounded-2xl p-4 backdrop-blur-sm border border-white/10 relative z-10">
              <p className="text-sm font-medium text-primary-100 text-center">
                Keep it up! You're making great progress towards your academic goals.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary-500" />
                Up Next
              </h2>
              <button onClick={() => navigate('/calendar')} className="text-primary-500 bg-primary-50 p-2 rounded-xl hover:bg-primary-100 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {dashboard?.upcomingSchedules && dashboard.upcomingSchedules.length > 0 ? (
                  dashboard.upcomingSchedules.slice(0, 4).map((sched, idx) => (
                      <div key={sched.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl border border-slate-100 group relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-l-2xl"></div>
                          <p className="font-bold text-sm text-slate-800 truncate pr-12 group-hover:text-primary-700 transition-colors">{sched.title}</p>
                          <div className="flex justify-between items-center mt-2.5">
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 text-slate-400" /> {sched.date} at {sched.startTime}</p>
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white shadow-sm border border-slate-200 text-primary-600 uppercase">
                                  {sched.duration}m
                              </span>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarDays className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No upcoming sessions.</p>
                  </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
    </div>
  );
}
