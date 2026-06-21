import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/ai-career-coach': 'AI Career Coach',
  '/resume-analyzer': 'Resume Analyzer',
  '/placement-readiness': 'Placement Readiness',
  '/learning-assistant': 'Learning Assistant',
  '/document-tutor': 'Document Tutor',
  '/study-planner': 'Study Planner',
  '/tasks': 'Tasks',
  '/exams': 'Exams',
  '/resources': 'Resources',
  '/notes': 'AI Notes',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || '';

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto bg-bg-primary bg-grid-pattern">
          <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
