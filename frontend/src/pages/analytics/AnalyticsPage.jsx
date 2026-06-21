import { useState, useEffect } from 'react';
import {
  BarChart3, Flame, Clock, CheckSquare, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { studySessionsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import { StatPill } from '../../components/common/Shared';

const PIE_COLORS = ['#2563EB', '#22D3EE', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studySessionsAPI.getAnalytics().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-brand-blue" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={22} className="text-brand-cyan" /> Analytics
        </h1>
        <p className="text-text-secondary text-sm mt-1">Your study patterns over the last six weeks.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4"><StatPill icon={Clock} label="Total hours (6wk)" value={data?.total_hours ?? 0} color="blue" /></Card>
        <Card className="!p-4"><StatPill icon={BarChart3} label="Avg daily hours" value={data?.avg_daily_hours ?? 0} color="cyan" /></Card>
        <Card className="!p-4"><StatPill icon={CheckSquare} label="Task completion" value={`${data?.task_completion_rate ?? 0}%`} color="green" /></Card>
        <Card className="!p-4"><StatPill icon={Flame} label="Current streak" value={`${data?.current_streak ?? 0}d`} color="amber" /></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="text-white font-semibold text-sm mb-4">Weekly study hours</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.weekly_hours || []}>
              <XAxis dataKey="week" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#fff' }} />
              <Bar dataKey="hours" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-white font-semibold text-sm mb-4">Subject distribution</h3>
          {data?.subject_distribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.subject_distribution} dataKey="value" nameKey="subject" cx="50%" cy="50%" outerRadius={80} label={({ subject, value }) => `${subject} ${value}%`} labelLine={false}>
                  {data.subject_distribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-16">No study sessions logged yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-white font-semibold text-sm mb-4">Daily task completion</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.daily_tasks || []}>
            <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="done" stackId="a" fill="#10B981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="total" stackId="a" fill="#1E293B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
