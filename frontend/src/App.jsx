import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

import Dashboard from './pages/dashboard/Dashboard';
import CareerCoachPage from './pages/career-coach/CareerCoachPage';
import ResumeAnalyzerPage from './pages/resume/ResumeAnalyzerPage';
import DocumentTutorPage from './pages/documents/DocumentTutorPage';
import LearningAssistantPage from './pages/learning/LearningAssistantPage';
import StudyPlannerPage from './pages/planner/StudyPlannerPage';
import TasksPage from './pages/tasks/TasksPage';
import ExamsPage from './pages/exams/ExamsPage';
import NotesPage from './pages/notes/NotesPage';
import PlacementReadinessPage from './pages/placement/PlacementReadinessPage';
import ResourcesPage from './pages/resources/ResourcesPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-career-coach" element={<CareerCoachPage />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/document-tutor" element={<DocumentTutorPage />} />
            <Route path="/learning-assistant" element={<LearningAssistantPage />} />
            <Route path="/study-planner" element={<StudyPlannerPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/placement-readiness" element={<PlacementReadinessPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
