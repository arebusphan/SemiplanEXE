import { Bell, LogOut, User as UserIcon, Search, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PremiumModal from './PremiumModal'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="hidden md:flex items-center gap-2 bg-slate-100/80 rounded-xl px-4 py-2 w-80 transition-all focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-white focus-within:shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects, assignments..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Upgrade Button */}
          {isAuthenticated && !user?.isPremium && (
            <button
              onClick={() => setIsPremiumModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Crown className="w-4 h-4" />
              <span>Get Premium</span>
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-all duration-200 hover:shadow-sm"
          >
            <Bell className="w-4.5 h-4.5 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-accent-500 to-danger-500 rounded-full flex items-center justify-center">
              <span className="text-[9px] text-white font-bold">3</span>
            </span>
          </button>

          {/* User */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-700 leading-tight flex items-center gap-1.5">
                    {user?.name || 'User'}
                    {user?.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  </p>
                  <p className="text-[10px] text-slate-400">{user?.role === 'admin' ? 'Administrator' : user?.major || 'Student'}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200/60 py-2 z-50">
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" /> Profile
                  </button>
                  {!user?.isPremium && (
                    <button
                      onClick={() => { setIsPremiumModalOpen(true); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Crown className="w-4 h-4" /> Upgrade to Premium
                    </button>
                  )}
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); navigate('/login'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-500 hover:bg-danger-500/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
            >
              Login
            </button>
          )}
        </div>
      </div>
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
    </header>
  )
}
