import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';

export default function TopNav({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);

  useEffect(() => {
    usersAPI.getNotifications()
      .then((res) => {
        const unread = (res.data || []).filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-border-primary bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-white rounded-lg hover:bg-bg-tertiary"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-white hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-bg-secondary border border-border-primary rounded-lg px-3 py-1.5 w-64 focus-within:border-brand-blue/50 transition-colors">
          <Search size={15} className="text-text-muted" />
          <input
            placeholder="Search anything..."
            className="bg-transparent text-sm text-white placeholder-text-muted outline-none flex-1"
          />
          <kbd className="text-[10px] text-text-muted border border-border-primary rounded px-1.5 py-0.5">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-text-secondary hover:text-white rounded-lg hover:bg-bg-tertiary transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-cyan rounded-full shadow-glow-cyan" />
          )}
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <ChevronDown size={14} className="text-text-muted hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-bg-secondary border border-border-primary rounded-xl shadow-card overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border-primary">
                  <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-bg-tertiary transition-colors"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-bg-tertiary transition-colors"
                >
                  <Settings size={15} /> Settings
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-border-primary"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
