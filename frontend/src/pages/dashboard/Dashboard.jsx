import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import {
  Target, Clock, CheckSquare, BookMarked, FileText, StickyNote,
  TrendingUp, Bell, Sparkles, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import { Badge, ProgressBar, EmptyState } from '../../components/common/Shared';

function StatCard({ icon: Icon, label, value, suffix = '', trend, color = 'blue' }) {
  const colors = {
    blue: 'bg-brand-blue/10 text-brand-blue-light',
    cyan: 'bg-brand-cyan/10 text-brand-cyan',
    green: 'bg-brand-green/10 text-brand-green-light',
    amber: 'bg-brand-amber/10 text-brand-amber',
    purple: 'bg-brand-purple/10 text-violet-300',
  };
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={16} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-brand-green-light' : 'text-red-400'}`}>
            <TrendingUp size={11} className={trend < 0 ? 'rotate-180' : ''} /> {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}{suffix}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.allSettled([dashboardAPI.getStats(), dashboardAPI.getRecommendations()])
      .then(([statsRes, recRes]) => {
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        else setError(true);
        if (recRes.status === 'fulfilled') {
          const data = recRes.value.data;
          setRecommendations(Array.isArray(data) ? data : data?.recommendations || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const weeklyHours = stats?.weekly_study_hours || [
    { day: 'Mon', hours: 0 }, { day: 'Tue', hours: 0 }, { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 }, { day: 'Fri', hours: 0 }, { day: 'Sat', hours: 0 }, { day: 'Sun', hours: 0 },
  ];

  const readinessData = [{ name: 'readiness', value: stats?.placement_readiness ?? 0, fill: '#2563EB' }];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-bg-tertiary rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-bg-tertiary rounded-2xl" />)}
        </div>
        <div className="h-72 bg-bg-tertiary rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">Here's what's happening with your academic journey today.</p>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-brand-amber/10 border border-brand-amber/30 rounded-xl px-4 py-3">
          <AlertTriangle size={15} />
          Some dashboard data couldn't load. Showing what's available.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={FileText} label="ATS Score" value={stats?.ats_score ?? '—'} suffix={stats?.ats_score ? '%' : ''} color="blue" trend={stats?.ats_score_trend} />
        <StatCard icon={Target} label="Placement Readiness" value={stats?.placement_readiness ?? '—'} suffix={stats?.placement_readiness ? '%' : ''} color="purple" trend={stats?.readiness_trend} />
        <StatCard icon={Clock} label="Study Hours (week)" value={stats?.study_hours_this_week ?? 0} suffix="h" color="cyan" />
        <StatCard icon={CheckSquare} label="Task Completion" value={stats?.task_completion_rate ?? 0} suffix="%" color="green" />
        <StatCard icon={BookMarked} label="Upcoming Exams" value={stats?.upcoming_exams_count ?? 0} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Weekly study hours chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Weekly study hours</h3>
            <Badge color="cyan">This week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyHours}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="hours" stroke="#22D3EE" strokeWidth={2} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Placement readiness radial */}
        <Card>
          <h3 className="text-white font-semibold text-sm mb-2">Placement readiness</h3>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={readinessData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#1E293B' }} dataKey="value" cornerRadius={10} fill="#2563EB" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{stats?.placement_readiness ?? 0}</span>
              <span className="text-xs text-text-muted">out of 100</span>
            </div>
          </div>
          <Link to="/placement-readiness" className="flex items-center justify-center gap-1.5 text-xs text-brand-blue-light hover:text-brand-cyan mt-2 font-medium">
            View full breakdown <ArrowRight size={12} />
          </Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* AI Recommendations */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-brand-cyan" />
            <h3 className="text-white font-semibold text-sm">AI recommendations for today</h3>
          </div>
          {recommendations.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No recommendations yet"
              description="Upload a resume or complete a study session to get personalized AI guidance."
            />
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 4).map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-tertiary border border-border-primary">
                  <Badge color={r.priority === 'high' ? 'red' : r.priority === 'medium' ? 'amber' : 'gray'}>
                    {r.type || 'tip'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{r.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick links */}
        <Card>
          <h3 className="text-white font-semibold text-sm mb-4">Quick actions</h3>
          <div className="space-y-2">
            {[
              { to: '/ai-career-coach', icon: Sparkles, label: 'Ask Career Coach' },
              { to: '/resume-analyzer', icon: FileText, label: 'Re-analyze resume' },
              { to: '/notes', icon: StickyNote, label: 'Create a note' },
              { to: '/study-planner', icon: Clock, label: 'Plan today' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-bg-tertiary border border-transparent hover:border-border-primary transition-all"
              >
                <a.icon size={15} className="text-brand-blue-light" />
                {a.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
