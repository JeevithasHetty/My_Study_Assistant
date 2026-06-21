import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log("BASE_URL =", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  me: () => api.get('/auth/me'),
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecommendations: () => api.get('/dashboard/recommendations'),
};

// ─── TASKS ───────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: () => api.get('/tasks/'),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
};

// ─── EXAMS ───────────────────────────────────────────────────────────────────
export const examsAPI = {
  getAll: () => api.get('/exams/'),
  create: (data) => api.post('/exams/', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  getReadiness: (id) => api.get(`/exams/${id}/readiness`),
};

// ─── STUDY SESSIONS / PLANNER ────────────────────────────────────────────────
export const plannerAPI = {
  getSessions: () => api.get('/planner/sessions'),
  create: (data) => api.post('/planner/sessions', data),
  update: (id, data) => api.put(`/planner/sessions/${id}`, data),
  complete: (id) => api.patch(`/planner/sessions/${id}/complete`),
  getAIPlan: () => api.get('/planner/ai-plan'),
};

export const studySessionsAPI = {
  getAll: () => api.get('/study-sessions/'),
  start: (data) => api.post('/study-sessions/start', data),
  end: (id) => api.post(`/study-sessions/${id}/end`),
  getAnalytics: () => api.get('/study-sessions/analytics'),
};

// ─── RESUME ──────────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/resume/'),
  getAnalysis: (id) => api.get(`/resume/${id}/analysis`),
  analyzeJD: (id, jd) => api.post(`/resume/${id}/analyze-jd`, { job_description: jd }),
  getRoadmap: (id) => api.get(`/resume/${id}/roadmap`),
};

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────
export const documentsAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/documents/'),
  getSummary: (id) => api.get(`/documents/${id}/summary`),
  getConcepts: (id) => api.get(`/documents/${id}/concepts`),
  getMCQs: (id) => api.get(`/documents/${id}/mcqs`),
  getFlashcards: (id) => api.get(`/documents/${id}/flashcards`),
  ask: (id, question) => api.post(`/documents/${id}/ask`, { question }),
  getYouTube: (id) => api.get(`/documents/${id}/youtube`),
};

// ─── PLACEMENT ───────────────────────────────────────────────────────────────
export const placementAPI = {
  getReadiness: () => api.get('/placement/readiness'),
  getRoadmap: () => api.get('/placement/roadmap'),
  getSkillGaps: () => api.get('/placement/skill-gaps'),
  chat: (message) => api.post('/placement/ai-coach', { message }),
};

// ─── RESOURCES ───────────────────────────────────────────────────────────────
export const resourcesAPI = {
  getAll: (params) => api.get('/resources/', { params }),
  getAICurated: () => api.get('/resources/ai-curated'),
  save: (id) => api.post(`/resources/${id}/save`),
  unsave: (id) => api.delete(`/resources/${id}/save`),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.patch(`/users/notifications/${id}/read`),
  markAllRead: () => api.patch('/users/notifications/mark-all-read'),
};

// ─── NOTES ───────────────────────────────────────────────────────────────────
export const notesAPI = {
  // Folders
  getFolders: () => api.get('/notes/folders'),
  createFolder: (data) => api.post('/notes/folders', data),
  deleteFolder: (id) => api.delete(`/notes/folders/${id}`),
  // Notes
  getAll: (params) => api.get('/notes/', { params }),
  create: (data) => api.post('/notes/', data),
  get: (id) => api.get(`/notes/${id}`),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  toggleStar: (id) => api.patch(`/notes/${id}/star`),
  // AI operations
  summarize: (id) => api.post(`/notes/${id}/ai/summarize`),
  flashcards: (id) => api.post(`/notes/${id}/ai/flashcards`),
  mcqs: (id) => api.post(`/notes/${id}/ai/mcqs`),
  interviewQuestions: (id) => api.post(`/notes/${id}/ai/interview-questions`),
  explain: (id) => api.post(`/notes/${id}/ai/explain`),
  ask: (id, question) => api.post(`/notes/${id}/ai/ask`, { question }),
};

// ─── LEARNING ASSISTANT ───────────────────────────────────────────────────────
export const learningAPI = {
  explain: (topic, difficulty = 'medium', context = '') =>
    api.post('/learning/explain', { topic, difficulty, context }),
  practiceQuestions: (topic, difficulty = 'medium') =>
    api.post('/learning/practice-questions', { topic, difficulty }),
  interviewQuestions: (topic) =>
    api.post('/learning/interview-questions', { topic }),
  relatedTopics: (topic) =>
    api.post('/learning/related-topics', { topic }),
  careerRelevance: (topic) =>
    api.post('/learning/career-relevance', { topic }),
};

// ─── CAREER COACH ─────────────────────────────────────────────────────────────
export const careerCoachAPI = {
  getInsights: () => api.get('/career-coach/insights'),
  getWeeklyGoals: () => api.get('/career-coach/weekly-goals'),
  getSkillRoadmap: () => api.get('/career-coach/skill-roadmap'),
  chat: (message, agent = 'career_coach') =>
    api.post('/career-coach/chat', { message, agent }),
  getExamPlan: (params) => api.get('/career-coach/exam-planner', { params }),
};
