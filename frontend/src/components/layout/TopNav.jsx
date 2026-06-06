import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const notificationCount = 3; // TODO: Get from API

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-white border-b border-slate-200 backdrop-blur-md bg-white/80"
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Menu Button (Mobile) */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Search Bar */}
          <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors ${
            isSearchActive ? 'border-blue-400 bg-blue-50' : ''
          }`}>
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search topics, resources..."
              className="bg-transparent text-sm focus:outline-none w-64"
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => setIsSearchActive(false)}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-slate-600" />
            {notificationCount > 0 && (
              <Badge variant="error" className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center p-0">
                {notificationCount}
              </Badge>
            )}
          </motion.button>

          {/* Settings */}
          <Link to="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings size={20} className="text-slate-600" />
            </motion.button>
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900">{user?.name?.split(' ')[0]}</span>
                <span className="text-xs text-slate-500">{user?.branch}</span>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
                >
                  {/* Profile Info */}
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                    >
                      <User size={18} />
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors text-red-600"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
