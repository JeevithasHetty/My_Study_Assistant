import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookMarked, Plus, X, Trash2, Calendar, Loader2, Sparkles, ChevronRight,
} from 'lucide-react';
import { examsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, ProgressBar, EmptyState } from '../../components/common/Shared';

function NewExamModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', subject_code: '', exam_date: '', duration_hours: 3, topics: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name || !form.exam_date) return;
    setSaving(true);
    try {
      await onCreate({
        ...form,
        duration_hours: Number(form.duration_hours),
        topics: form.topics.split(',').map((t) => t.trim()).filter(Boolean),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border-primary rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">New exam</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input placeholder="Exam name (e.g. DBMS Mid-Sem)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-dark" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Subject code" value={form.subject_code} onChange={(e) => setForm((f) => ({ ...f, subject_code: e.target.value }))} className="input-dark" />
            <input type="number" min="1" step="0.5" placeholder="Duration (h)" value={form.duration_hours} onChange={(e) => setForm((f) => ({ ...f, duration_hours: e.target.value }))} className="input-dark" />
          </div>
          <input type="datetime-local" value={form.exam_date} onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))} className="input-dark" />
          <input placeholder="Topics (comma separated)" value={form.topics} onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))} className="input-dark" />
          <Button onClick={submit} loading={saving} className="w-full">Add exam</Button>
        </div>
      </motion.div>
    </div>
  );
}

function ExamCard({ exam, onDelete, onSelect }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(exam.exam_date) - new Date()) / 86400000));
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold">{exam.name}</p>
          {exam.subject_code && <p className="text-xs text-text-muted">{exam.subject_code}</p>}
        </div>
        <button onClick={() => onDelete(exam.id)} className="text-text-muted hover:text-red-400"><Trash2 size={14} /></button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Badge color={daysLeft <= 7 ? 'red' : daysLeft <= 14 ? 'amber' : 'gray'}>
          {daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
        </Badge>
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Calendar size={11} /> {new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-secondary">Readiness</span>
          <span className="text-white font-medium">{exam.readiness_score}%</span>
        </div>
        <ProgressBar value={exam.readiness_score} color={exam.readiness_score >= 70 ? 'green' : 'amber'} />
      </div>
      {exam.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {exam.topics.slice(0, 3).map((t, i) => <Badge key={i} color="blue">{t}</Badge>)}
        </div>
      )}
      <button onClick={() => onSelect(exam)} className="flex items-center gap-1 text-xs text-brand-blue-light hover:text-brand-cyan font-medium">
        <Sparkles size={11} /> View AI readiness plan <ChevronRight size={11} />
      </button>
    </Card>
  );
}

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(false);

  useEffect(() => { loadExams(); }, []);

  const loadExams = () => {
    setLoading(true);
    examsAPI.getAll().then((res) => setExams(res.data)).finally(() => setLoading(false));
  };

  const createExam = async (data) => {
    await examsAPI.create(data);
    loadExams();
  };

  const deleteExam = async (id) => {
    setExams((e) => e.filter((x) => x.id !== id));
    await examsAPI.delete(id);
  };

  const selectExam = async (exam) => {
    setSelectedExam(exam);
    setReadinessLoading(true);
    try {
      const res = await examsAPI.getReadiness(exam.id);
      setReadiness(res.data);
    } finally {
      setReadinessLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookMarked size={22} className="text-brand-amber" /> Exams
          </h1>
          <p className="text-text-secondary text-sm mt-1">Track upcoming exams and your readiness for each.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add exam</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-blue" /></div>
      ) : exams.length === 0 ? (
        <Card>
          <EmptyState icon={BookMarked} title="No exams scheduled" description="Add your upcoming exams to track readiness and get AI-powered prep recommendations." action={<Button icon={Plus} onClick={() => setShowModal(true)}>Add exam</Button>} />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onDelete={deleteExam} onSelect={selectExam} />
          ))}
        </div>
      )}

      {selectedExam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedExam(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="bg-bg-card border border-border-primary rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">{selectedExam.name} — AI readiness plan</h3>
              <button onClick={() => setSelectedExam(null)} className="text-text-muted hover:text-white"><X size={18} /></button>
            </div>
            {readinessLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-brand-blue" /></div>
            ) : readiness ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-white">{readiness.readiness_score}%</span>
                  <Badge color={readiness.days_left <= 7 ? 'red' : 'amber'}>{readiness.days_left} days left</Badge>
                </div>
                <div className="space-y-2 pt-2">
                  {readiness.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Sparkles size={13} className="text-brand-cyan flex-shrink-0 mt-0.5" /> {r}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}

      {showModal && <NewExamModal onClose={() => setShowModal(false)} onCreate={createExam} />}
    </div>
  );
}
