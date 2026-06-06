// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  
  // Main features
  AI_CAREER_COACH: '/ai-career-coach',
  STUDY_PLANNER: '/study-planner',
  EXAMS: '/exams',
  TASKS: '/tasks',
  
  // Learning & Resources
  LEARNING_ASSISTANT: '/learning-assistant',
  RESOURCES: '/resources',
  DOCUMENT_TUTOR: '/document-tutor',
  NOTES: '/notes',
  
  // Resume & Placement
  RESUME_ANALYZER: '/resume-analyzer',
  PLACEMENT_READINESS: '/placement-readiness',
  
  // System
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
};

export const SIDEBAR_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: ROUTES.DASHBOARD,
    icon: 'BarChart3',
  },
  {
    id: 'ai-coach',
    label: 'AI Career Coach',
    route: ROUTES.AI_CAREER_COACH,
    icon: 'Bot',
    badge: 'New',
  },
  {
    id: 'study-planner',
    label: 'Study Planner',
    route: ROUTES.STUDY_PLANNER,
    icon: 'BookOpen',
  },
  {
    id: 'exams',
    label: 'Exams',
    route: ROUTES.EXAMS,
    icon: 'ClipboardList',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    route: ROUTES.TASKS,
    icon: 'CheckSquare',
  },
  {
    id: 'learning-assistant',
    label: 'Learning Assistant',
    route: ROUTES.LEARNING_ASSISTANT,
    icon: 'Lightbulb',
  },
  {
    id: 'document-tutor',
    label: 'Document Tutor',
    route: ROUTES.DOCUMENT_TUTOR,
    icon: 'FileText',
  },
  {
    id: 'notes',
    label: 'Notes',
    route: ROUTES.NOTES,
    icon: 'Notebook',
  },
  {
    id: 'resume-analyzer',
    label: 'Resume Analyzer',
    route: ROUTES.RESUME_ANALYZER,
    icon: 'FileCheck',
  },
  {
    id: 'placement',
    label: 'Placement Readiness',
    route: ROUTES.PLACEMENT_READINESS,
    icon: 'Target',
  },
  {
    id: 'resources',
    label: 'Resources',
    route: ROUTES.RESOURCES,
    icon: 'Library',
  },
];
