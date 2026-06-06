import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const upcomingExams = [
  { id: 1, name: 'Data Structures', date: '15 June', priority: 'High', readiness: 65 },
  { id: 2, name: 'Web Development', date: '20 June', priority: 'Medium', readiness: 72 },
  { id: 3, name: 'Database Design', date: '25 June', priority: 'High', readiness: 58 },
];

const todaysTasks = [
  { id: 1, title: 'Study DSA Sorting Algorithms', completed: true, time: '2h' },
  { id: 2, title: 'Solve 5 LeetCode Problems', completed: false, time: '1.5h' },
  { id: 3, title: 'Watch FastAPI Tutorial', completed: false, time: '1h' },
  { id: 4, title: 'Practice Interview Q&A', completed: false, time: '1h' },
];

export function UpcomingExams() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Upcoming Exams
          </h3>
          <a href="/exams" className="text-blue-600 text-sm font-medium hover:underline">
            View All
          </a>
        </div>

        <div className="space-y-3">
          {upcomingExams.map((exam, idx) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{exam.name}</p>
                <p className="text-xs text-slate-500">{exam.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${exam.readiness}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700 w-10">{exam.readiness}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function TodaysTasks() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Today's Tasks
          </h3>
          <a href="/tasks" className="text-blue-600 text-sm font-medium hover:underline">
            View All
          </a>
        </div>

        <div className="space-y-2">
          {todaysTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={task.completed}
                className="w-5 h-5 rounded cursor-pointer accent-blue-600"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.title}
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{task.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
