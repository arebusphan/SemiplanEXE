import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Settings,
  GraduationCap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const dynamicNavItems = user?.role === 'admin' 
    ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin Dashboard' }]
    : navItems;

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full w-[260px]
        bg-white/80 backdrop-blur-xl
        border-r border-slate-200/60
        flex flex-col
        transition-all duration-300 ease-in-out
        lg:translate-x-0 -translate-x-full
        shadow-[4px_0_24px_-2px_rgba(0,0,0,0.03)]
      `}
    >
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            SemiPlan
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            AI Study Planner
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {dynamicNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/10 to-primary-500/5 text-primary-700 shadow-sm border border-primary-200/50'
                  : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-800'
              }`
            }
          >
            <item.icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110 ${
              location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                ? 'text-primary-600'
                : ''
            }`} />
            <span>{item.label}</span>
            {item.label === 'Dashboard' && (
              <Sparkles className="w-3 h-3 ml-auto text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  )
}
