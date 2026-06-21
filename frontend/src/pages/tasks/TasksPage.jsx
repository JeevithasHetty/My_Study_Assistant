import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Plus, X, Trash2, Clock, Flag, Loader2,
} from 'lucide-react';
import { tasksAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, EmptyState } from '../../components/common/Shared';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'gray' },
  { key: 'inprogress', label: 'In Progress', color: 'blue' },
  { key: 'done', label: 'Done', color: 'green' },
];

const PRIORITY_COLOR = { high: 'red', medium: 'amber', low: 'gray' };

function NewTaskModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', tag: '', due_date: '', estimated_hours: 1 });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onCreate({ ...form, estimated_hours: Number(form.estimated_hours) || 1, due_date: form.due_date || null });
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
          <h3 className="text-white font-semibold">New task</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input placeholder="Task title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-dark" />
          <textarea placeholder="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-dark resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="input-dark">
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input placeholder="Tag" value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} className="input-dark" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="input-dark" />
            <input type="number" min="0.5" step="0.5" placeholder="Est. hours" value={form.estimated_hours} onChange={(e) => setForm((f) => ({ ...f, estimated_hours: e.target.value }))} className="input-dark" />
          </div>
          <Button onClick={submit} loading={saving} className="w-full">Create task</Button>
        </div>
      </motion.div>
    </div>
  );
}

function TaskCard({ task, onStatusChange, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-tertiary border border-border-primary rounded-xl p-3.5 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm text-white font-medium">{task.title}</p>
        <button onClick={() => onDelete(task.id)} className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
      {task.description && <p className="text-xs text-text-secondary mb-2 line-clamp-2">{task.description}</p>}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <Badge color={PRIORITY_COLOR[task.priority]}><Flag size={9} className="inline mr-0.5" />{task.priority}</Badge>
        {task.tag && <Badge color="blue">{task.tag}</Badge>}
        {task.due_date && <span className="text-[10px] text-text-muted flex items-center gap-0.5"><Clock size={10} /> {new Date(task.due_date).toLocaleDateString()}</span>}
      </div>
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        className="text-xs bg-bg-card border border-border-primary rounded-lg px-2 py-1 text-text-secondary w-full"
      >
        {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
    </motion.div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = () => {
    setLoading(true);
    tasksAPI.getAll().then((res) => setTasks(res.data)).finally(() => setLoading(false));
  };

  const createTask = async (data) => {
    await tasksAPI.create(data);
    loadTasks();
  };

  const updateStatus = async (id, status) => {
    setTasks((t) => t.map((task) => (task.id === id ? { ...task, status } : task)));
    await tasksAPI.updateStatus(id, status);
  };

  const deleteTask = async (id) => {
    setTasks((t) => t.filter((task) => task.id !== id));
    await tasksAPI.delete(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare size={22} className="text-brand-green-light" /> Tasks
          </h1>
          <p className="text-text-secondary text-sm mt-1">Track your academic to-dos across three stages.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New task</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-blue" /></div>
      ) : tasks.length === 0 ? (
        <Card>
          <EmptyState icon={CheckSquare} title="No tasks yet" description="Create your first task to start tracking your academic work." action={<Button icon={Plus} onClick={() => setShowModal(true)}>New task</Button>} />
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="bg-bg-secondary border border-border-primary rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{col.label}</h3>
                    <Badge color={col.color}>{colTasks.length}</Badge>
                  </div>
                </div>
                <div className="space-y-2.5 min-h-[100px]">
                  <AnimatePresence>
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onStatusChange={updateStatus} onDelete={deleteTask} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <NewTaskModal onClose={() => setShowModal(false)} onCreate={createTask} />}
    </div>
  );
}
