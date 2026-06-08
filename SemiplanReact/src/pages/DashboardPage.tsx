import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/api';
import type { Dashboard } from '../types';
import {
  Sparkles,
  Target, CalendarDays, CheckCircle2,
  Flame, ChevronRight, Clock, BookOpen
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (user) {
      getDashboard()
        .then(data => {
          setDashboard(data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up max-w-[1400px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> AI Study Assistant Active
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm">Here is your learning overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Overview Stats & Subject Progress */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Subjects</p>
                <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-500" /> {dashboard?.totalSubjects || 0}
                </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Study Hours</p>
                <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" /> {dashboard?.totalStudyHours || 0}
                </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sessions Done</p>
                <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> {dashboard?.completedSessions || 0}
                </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Streak</p>
                <p className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> {dashboard?.currentStreak || 0}
                </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Subject Progress
                </h2>
                <p className="text-sm text-slate-500 mt-1">Your completion rates per subject</p>
              </div>
              <button 
                onClick={() => navigate('/subjects')}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {dashboard?.subjectProgress && dashboard.subjectProgress.length > 0 ? (
                  dashboard.subjectProgress.map((subject) => (
                    <div key={subject.subjectId}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-slate-700">{subject.subjectTitle}</h4>
                        <span className="text-sm font-black" style={{ color: subject.subjectColor || '#3b82f6' }}>{subject.completionPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${subject.completionPercent}%`, backgroundColor: subject.subjectColor || '#3b82f6' }} 
                        />
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">No subjects found. Add a subject to track your progress.</p>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Goals, Workload, Readiness */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-6 shadow-lg shadow-primary-500/20 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-full" />
            <h2 className="font-bold text-primary-100 flex items-center gap-2 mb-6">
              <Target className="w-5 h-5" />
              Overall Progress
            </h2>
            
            <div className="flex items-end justify-between mb-2">
              <p className="text-3xl font-black">{dashboard?.overallProgress || 0}%</p>
            </div>
            
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-success-400 rounded-full relative">
                <div 
                    className="absolute inset-y-0 left-0 bg-white/40" 
                    style={{ width: `${dashboard?.overallProgress || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <CalendarDays className="w-5 h-5 text-primary-500" />
              Upcoming Schedules
            </h2>
            
            <div className="space-y-4">
              {dashboard?.upcomingSchedules && dashboard.upcomingSchedules.length > 0 ? (
                  dashboard.upcomingSchedules.slice(0, 4).map((sched) => (
                      <div key={sched.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="font-bold text-sm text-slate-800 truncate">{sched.title}</p>
                          <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {sched.date} {sched.startTime}</p>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 uppercase">
                                  {sched.duration}m
                              </span>
                          </div>
                      </div>
                  ))
              ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No upcoming schedules.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
