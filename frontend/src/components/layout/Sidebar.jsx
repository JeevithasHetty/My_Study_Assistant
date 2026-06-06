import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  BookOpen,
  ClipboardList,
  CheckSquare,
  Lightbulb,
  FileText,
  Notebook,
  FileCheck,
  Target,
  Library,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import Badge from '../common/Badge';

const iconMap = {
  BarChart3,
  Bot,
  BookOpen,
  ClipboardList,
  CheckSquare,
  Lightbulb,
  FileText,
  Notebook,
  FileCheck,
  Target,
  Library,
};

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'BarChart3' },
  { id: 'ai-coach', label: 'AI Career Coach', route: '/ai-career-coach', icon: 'Bot', badge: 'New' },
  { id: 'study-planner', label: 'Study Planner', route: '/study-planner', icon: 'BookOpen' },
  { id: 'exams', label: 'Exams', route: '/exams', icon: 'ClipboardList' },
  { id: 'tasks', label: 'Tasks', route: '/tasks', icon: 'CheckSquare' },
  { id: 'learning-assistant', label: 'Learning Assistant', route: '/learning-assistant', icon: 'Lightbulb' },
  { id: 'document-tutor', label: 'Document Tutor', route: '/document-tutor', icon: 'FileText' },
  { id: 'notes', label: 'Notes', route: '/notes', icon: 'Notebook' },
  { id: 'resume-analyzer', label: 'Resume Analyzer', route: '/resume-analyzer', icon: 'FileCheck' },
  { id: 'placement', label: 'Placement Readiness', route: '/placement-readiness', icon: 'Target' },
  { id: 'resources', label: 'Resources', route: '/resources', icon: 'Library' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -280, opacity: 0 },
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
        className={clsx(
          'fixed md:static left-0 top-0 z-50 h-screen w-64 bg-white border-r border-slate-200',
          'overflow-y-auto md:overflow-y-visible',
          'transform md:transform-none transition-transform duration-300',
        )}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">StudentOS</h1>
              <p className="text-xs text-slate-500">AI Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = location.pathname === item.route;

            return (
              <Link
                key={item.id}
                to={item.route}
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent',
                  )}
                >
                  <Icon size={20} />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && <Badge variant="info">{item.badge}</Badge>}
                  {isActive && <ChevronRight size={18} className="ml-auto" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50 hidden md:block">
          <p className="text-xs text-slate-500 text-center">v1.0.0 • StudentOS AI</p>
        </div>
      </motion.aside>
    </>
  );
}
