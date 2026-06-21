import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Plus, Sparkles, Clock, CheckCircle2, Circle,
  Loader2, X, Trash2,
} from 'lucide-react';
import { plannerAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, EmptyState } from '../../components/common/Shared';

const SUBJECT_COLORS = ['blue', 'cyan', 'green', 'purple', 'amber'];

function NewSessionModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ task_description: '', subject: '', scheduled_date: '', duration_hours: 1 });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.task_description || !form.subject || !form.scheduled_date) return;
    setSaving(true);
    try {
      await onCreate({ ...form, duration_hours: Number(form.duration_hours) });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border-primary rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">New study session</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input placeholder="What will you study?" value={form.task_description} onChange={(e) => setForm((f) => ({ ...f, task_description: e.target.value }))} className="input-dark" />
          <input placeholder="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="input-dark" />
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} className="input-dark" />
            <input type="number" min="0.5" step="0.5" placeholder="Hours" value={form.duration_hours} onChange={(e) => setForm((f) => ({ ...f, duration_hours: e.target.value }))} className="input-dark" />
          </div>
          <Button onClick={submit} loading={saving} className="w-full">Schedule session</Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function StudyPlannerPage() {
  const [sessions, setSessions] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    setLoading(true);
    plannerAPI.getSessions().then((res) => setSessions(res.data)).finally(() => setLoading(false));
  };

  const generateAIPlan = async () => {
    setAiLoading(true);
    try {
      const res = await plannerAPI.getAIPlan();
      setAiPlan(res.data);
    } finally {
      setAiLoading(false);
    }
  };

  const createSession = async (data) => {
    await plannerAPI.create(data);
    loadSessions();
  };

  const completeSession = async (id) => {
    await plannerAPI.complete(id);
    loadSessions();
  };

  const grouped = sessions.reduce((acc, s) => {
    const date = new Date(s.scheduled_date).toDateString();
    acc[date] = acc[date] || [];
    acc[date].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays size={22} className="text-brand-green-light" /> Study Planner
          </h1>
          <p className="text-text-secondary text-sm mt-1">Schedule sessions or let AI build your week.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Sparkles} onClick={generateAIPlan} loading={aiLoading}>AI weekly plan</Button>
          <Button icon={Plus} onClick={() => setShowModal(true)}>New session</Button>
        </div>
      </div>

      {aiPlan && (
        <Card>
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand-cyan" /> AI-generated weekly plan
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(aiPlan.plan || []).map((day, i) => (
              <div key={i} className="bg-bg-tertiary border border-border-primary rounded-xl p-3.5">
                <p className="text-white text-sm font-semibold mb-2">{day.day}</p>
                <div className="space-y-2">
                  {(day.sessions || []).map((s, j) => (
                    <div key={j} className="text-xs">
                      <p className="text-text-secondary font-medium">{s.subject}</p>
                      <p className="text-text-muted">{s.duration}h — {s.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-blue" /></div>
      ) : sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No sessions scheduled"
            description="Add a study session manually or generate an AI weekly plan to get started."
            action={<Button icon={Plus} onClick={() => setShowModal(true)}>New session</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, daySessions]) => (
            <Card key={date}>
              <p className="text-sm font-semibold text-white mb-3">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <div className="space-y-2">
                {daySessions.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-xl">
                    <button onClick={() => !s.is_completed && completeSession(s.id)}>
                      {s.is_completed ? <CheckCircle2 size={18} className="text-brand-green" /> : <Circle size={18} className="text-text-muted hover:text-brand-blue-light" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${s.is_completed ? 'text-text-muted line-through' : 'text-white'}`}>{s.task_description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge color={SUBJECT_COLORS[i % SUBJECT_COLORS.length]}>{s.subject}</Badge>
                        <span className="text-xs text-text-muted flex items-center gap-1"><Clock size={11} /> {s.duration_hours}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && <NewSessionModal onClose={() => setShowModal(false)} onCreate={createSession} />}
    </div>
  );
}
