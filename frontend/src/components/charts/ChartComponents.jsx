import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const chartData = [
  { name: 'Mon', hours: 4, completed: 3 },
  { name: 'Tue', hours: 6, completed: 5 },
  { name: 'Wed', hours: 5, completed: 4 },
  { name: 'Thu', hours: 8, completed: 7 },
  { name: 'Fri', hours: 7, completed: 6 },
  { name: 'Sat', hours: 9, completed: 8 },
  { name: 'Sun', hours: 5, completed: 4 },
];

export function StudyHoursChart() {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Study Hours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function TaskCompletionChart() {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Completion</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="completed" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
