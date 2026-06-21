import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Brain, FileText, BookOpen, StickyNote,
  CalendarDays, Target, CheckSquare, BookMarked, BarChart3,
  GraduationCap, Video, Bell, Settings, LogOut,
  ChevronLeft, Zap, X,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/ai-career-coach', icon: Brain, label: 'AI Career Coach', badge: 'AI' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Academic',
    items: [
      { to: '/study-planner', icon: CalendarDays, label: 'Study Planner' },
      { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { to: '/exams', icon: BookMarked, label: 'Exams' },
      { to: '/notes', icon: StickyNote, label: 'AI Notes' },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { to: '/learning-assistant', icon: GraduationCap, label: 'Learning Assistant' },
      { to: '/document-tutor', icon: BookOpen, label: 'Document Tutor' },
      { to: '/resume-analyzer', icon: FileText, label: 'Resume Analyzer' },
      { to: '/resources', icon: Video, label: 'Resources' },
    ],
  },
  {
    label: 'Placement',
    items: [
      { to: '/placement-readiness', icon: Target, label: 'Placement Readiness' },
    ],
  },
];

function NavItem({ to, icon: Icon, label, badge, collapsed }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: collapsed ? 0 : 2 }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative
            ${isActive
              ? 'bg-brand-blue/15 text-brand-blue-light border border-brand-blue/25 shadow-glow-blue/20'
              : 'text-text-secondary hover:text-white hover:bg-bg-tertiary border border-transparent'
            }`}
        >
          <Icon
            size={18}
            className={isActive ? 'text-brand-blue-light' : 'text-text-muted group-hover:text-text-secondary'}
          />
          {!collapsed && (
            <span className="flex-1 truncate">{label}</span>
          )}
          {!collapsed && badge && (
            <span className="text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-blue rounded-r"
            />
          )}
        </motion.div>
      )}
    </NavLink>
  );
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`
          fixed lg:relative h-full z-50 lg:z-auto flex flex-col
          bg-bg-secondary border-r border-border-primary
          ${isOpen ? 'left-0' : '-left-64 lg:left-0'}
          transition-[left] duration-300
        `}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border-primary flex-shrink-0">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center shadow-glow-blue">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">StudentOS</p>
                <p className="text-[10px] text-brand-cyan font-medium">AI Platform</p>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center mx-auto shadow-glow-blue">
              <Zap size={16} className="text-white" />
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-text-muted hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.to} {...item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border-primary px-3 py-3 space-y-0.5 flex-shrink-0">
          <NavItem to="/notifications" icon={Bell} label="Notifications" collapsed={collapsed} />
          <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>

          {/* User */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-bg-tertiary border border-border-primary">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Student'}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email || ''}</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-bg-tertiary border border-border-primary rounded-full hidden lg:flex items-center justify-center text-text-muted hover:text-white hover:border-brand-blue transition-all"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft size={12} />
          </motion.div>
        </button>
      </motion.aside>
    </>
  );
}
