import { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Target, 
  AlertCircle,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';

const mockProgressData = {
  overallCompletion: 68,
  totalStudyHours: 142.5,
  missedSessions: 3,
  learningStreak: 12,
  subjectProgress: [
    { id: 1, title: 'Database Systems', color: 'bg-blue-500', progress: 85, hours: 45 },
    { id: 2, title: 'Machine Learning', color: 'bg-purple-500', progress: 40, hours: 32 },
    { id: 3, title: 'Web Development', color: 'bg-pink-500', progress: 92, hours: 55 },
    { id: 4, title: 'Operating Systems', color: 'bg-amber-500', progress: 25, hours: 10.5 },
  ],
  weeklyStats: [
    { day: 'Mon', hours: 3 },
    { day: 'Tue', hours: 4.5 },
    { day: 'Wed', hours: 2 },
    { day: 'Thu', hours: 5 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 6 },
    { day: 'Sun', hours: 1 },
  ]
};

export default function ProgressPage() {
  const [data] = useState(mockProgressData);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Your Progress</h1>
        <p className="text-slate-500 mt-2">Track your learning journey and stay on top of your goals.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Overall Completion</p>
                <h3 className="text-2xl font-bold text-slate-800">{data.overallCompletion}%</h3>
              </div>
            </div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${data.overallCompletion}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-success-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-100 text-success-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Study Hours</p>
              <h3 className="text-2xl font-bold text-slate-800">{data.totalStudyHours}h</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Learning Streak</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-800">{data.learningStreak}</h3>
                <span className="text-sm font-medium text-slate-500">days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-danger-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Missed Sessions</p>
              <h3 className="text-2xl font-bold text-slate-800">{data.missedSessions}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  Subject Progress
                </h2>
                <p className="text-sm text-slate-500">Your progress across all active subjects</p>
              </div>
            </div>
            <div className="space-y-6">
              {data.subjectProgress.map(subject => (
                <div key={subject.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">{subject.title}</h4>
                      <p className="text-xs text-slate-500">{subject.hours} hours studied</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{subject.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${subject.color} rounded-full transition-all duration-1000 ease-out`} 
                      style={{ width: `${subject.progress}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Statistics Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  Weekly Study Hours
                </h2>
              </div>
            </div>
            <div className="flex items-end gap-2 h-48 mt-4">
              {data.weeklyStats.map((stat, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center h-full items-end">
                    <div 
                      className="w-full max-w-[40px] bg-primary-100 group-hover:bg-primary-200 rounded-t-lg transition-all duration-300 relative"
                      style={{ height: `${(stat.hours / 8) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {stat.hours}h
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{stat.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestones & Achievements */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-warning-500" />
              <h2 className="text-lg font-bold text-slate-800">Recent Achievements</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">7-Day Streak</h4>
                  <p className="text-xs text-slate-500 mt-1">You studied for 7 consecutive days. Keep it up!</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">100 Hours Milestone</h4>
                  <p className="text-xs text-slate-500 mt-1">You've reached 100 total hours of studying!</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-success-100 text-success-600 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Web Dev Master</h4>
                  <p className="text-xs text-slate-500 mt-1">Completed 90% of Web Development subject.</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              View All Achievements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
