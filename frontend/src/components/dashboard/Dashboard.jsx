import { motion } from 'framer-motion';
import {
  BarChart3,
  Target,
  CheckCircle,
  BookOpen,
  FileText,
  AlertCircle,
  Zap,
  TrendingUp,
} from 'lucide-react';
import DashboardCard from '../charts/DashboardCard';
import { StudyHoursChart, TaskCompletionChart } from '../charts/ChartComponents';
import { UpcomingExams, TodaysTasks } from './DashboardWidgets';
import Card from '../common/Card';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Dashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome back! Here's your academic progress overview.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button variant="secondary">Export Report</Button>
            <Button>Quick Start Guide</Button>
          </div>
        </div>
      </motion.div>

      {/* AI Recommendation Card */}
      <motion.div variants={itemVariants}>
        <Card glass={true} className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600/10 rounded-lg">
                <Zap size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Recommendation</h3>
                <p className="text-slate-700 mb-4">
                  📚 Focus on Data Structures this week! Complete 5 LeetCode problems and watch the DSA masterclass.
                </p>
                <Link to="/ai-career-coach">
                  <Button size="sm" variant="primary">Get Personalized Plan</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            icon={Target}
            title="ATS Score"
            value="72%"
            subtext="↑ +5% this month"
            trend={5}
            color="blue"
          />
          <DashboardCard
            icon={TrendingUp}
            title="Placement Ready"
            value="68%"
            subtext="2 gaps remaining"
            trend={8}
            color="green"
          />
          <DashboardCard
            icon={CheckCircle}
            title="Tasks Done"
            value="24/35"
            subtext="68% completion"
            trend={12}
            color="purple"
          />
          <DashboardCard
            icon={BookOpen}
            title="Study Hours"
            value="32h"
            subtext="This week"
            trend={3}
            color="orange"
          />
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudyHoursChart />
          <TaskCompletionChart />
        </div>
      </motion.div>

      {/* Main Content Row */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UpcomingExams />
          </div>
          <TodaysTasks />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/study-planner">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center cursor-pointer"
                >
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-slate-900">Study Planner</p>
                </motion.div>
              </Link>
              <Link to="/exams">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center cursor-pointer"
                >
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-slate-900">Exams</p>
                </motion.div>
              </Link>
              <Link to="/resume-analyzer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center cursor-pointer"
                >
                  <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-slate-900">Resume</p>
                </motion.div>
              </Link>
              <Link to="/ai-career-coach">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center cursor-pointer"
                >
                  <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-slate-900">AI Coach</p>
                </motion.div>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
