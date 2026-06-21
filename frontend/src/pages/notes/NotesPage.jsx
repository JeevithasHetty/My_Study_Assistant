import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote, Plus, Star, Search, Trash2, Sparkles,
  Brain, HelpCircle, Briefcase, BookOpen, Send, Loader2, X, FolderPlus,
  ChevronLeft, Menu,
} from 'lucide-react';
import { notesAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { Badge, EmptyState, Spinner } from '../../components/common/Shared';

const AI_ACTIONS = [
  { key: 'summarize', label: 'Summarize', icon: Sparkles },
  { key: 'flashcards', label: 'Flashcards', icon: Brain },
  { key: 'mcqs', label: 'MCQs', icon: HelpCircle },
  { key: 'interviewQuestions', label: 'Interview Qs', icon: Briefcase },
  { key: 'explain', label: 'Explain', icon: BookOpen },
];

function NewFolderModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
        className="bg-bg-card border border-border-primary rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white font-semibold mb-4">New folder</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" className="input-dark mb-3" autoFocus />
        <Button className="w-full" onClick={() => { if (name.trim()) { onCreate(name); onClose(); } }}>Create</Button>
      </motion.div>
    </div>
  );
}

function AIPanel({ activeNote, aiLoading, aiResult, askHistory, askInput, setAskInput, runAIAction, askQuestion, onClose }) {
  return (
    <div className="bg-bg-card border border-border-primary rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Sparkles size={14} className="text-brand-cyan" /> AI tools
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-text-muted hover:text-white xl:hidden"><X size={16} /></button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {AI_ACTIONS.map((a) => (
          <button
            key={a.key}
            onClick={() => runAIAction(a.key)}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-bg-tertiary border border-border-primary hover:border-brand-blue/30 text-text-secondary hover:text-white transition-colors"
          >
            <a.icon size={15} />
            <span className="text-[10px]">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto border-t border-border-primary pt-3 min-h-[120px]">
        {aiLoading ? (
          <div className="flex justify-center py-6"><Spinner size={20} /></div>
        ) : aiResult ? (
          <div className="text-xs text-text-secondary space-y-2">
            {aiResult.action === 'flashcards' && Array.isArray(aiResult.result) ? (
              aiResult.result.map((c, i) => (
                <div key={i} className="bg-bg-tertiary rounded-lg p-2.5">
                  <p className="text-white font-medium mb-1">{c.front}</p>
                  <p className="text-text-muted">{c.back}</p>
                </div>
              ))
            ) : aiResult.action === 'mcqs' && Array.isArray(aiResult.result) ? (
              aiResult.result.map((q, i) => (
                <div key={i} className="bg-bg-tertiary rounded-lg p-2.5">
                  <p className="text-white font-medium mb-1">{q.question}</p>
                  <p className="text-brand-green-light">{q.options?.[q.correct_answer]}</p>
                </div>
              ))
            ) : aiResult.action === 'interview_questions' && Array.isArray(aiResult.result) ? (
              <ul className="space-y-1.5">
                {aiResult.result.map((q, i) => <li key={i} className="bg-bg-tertiary rounded-lg p-2">{q}</li>)}
              </ul>
            ) : (
              <p className="whitespace-pre-line">{aiResult.result}</p>
            )}
          </div>
        ) : (
          <>
            {askHistory.map((m, i) => (
              <div key={i} className={`text-xs mb-2 ${m.role === 'user' ? 'text-white font-medium' : 'text-text-secondary'}`}>
                {m.role === 'user' ? `Q: ${m.text}` : m.text}
              </div>
            ))}
            {askHistory.length === 0 && <p className="text-xs text-text-muted">Pick a tool above, or ask a question about this note below.</p>}
          </>
        )}
      </div>

      <div className="flex gap-1.5 mt-3 pt-3 border-t border-border-primary">
        <input
          value={askInput}
          onChange={(e) => setAskInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          placeholder="Ask about this note..."
          className="input-dark text-xs flex-1"
        />
        <button onClick={askQuestion} className="p-2 rounded-lg bg-brand-blue text-white flex-shrink-0"><Send size={13} /></button>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false); // mobile/tablet overlay toggle
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [askInput, setAskInput] = useState('');
  const [askHistory, setAskHistory] = useState([]);
  const saveTimer = useRef(null);

  useEffect(() => {
    loadFolders();
    loadNotes();
  }, []);

  useEffect(() => {
    loadNotes();
  }, [activeFolder, search]);

  const loadFolders = () => notesAPI.getFolders().then((res) => setFolders(res.data));

  const loadNotes = () => {
    setLoading(true);
    const params = {};
    if (activeFolder) params.folder_id = activeFolder;
    if (search) params.search = search;
    notesAPI.getAll(params).then((res) => setNotes(res.data)).finally(() => setLoading(false));
  };

  const createNote = async () => {
    const res = await notesAPI.create({ title: 'Untitled note', content: '', folder_id: activeFolder });
    setNotes((n) => [res.data, ...n]);
    setActiveNote(res.data);
    setAiResult(null);
    setAskHistory([]);
  };

  const createFolder = async (name) => {
    const res = await notesAPI.createFolder({ name });
    setFolders((f) => [...f, res.data]);
  };

  const updateNote = (field, value) => {
    setActiveNote((n) => ({ ...n, [field]: value }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const wordCount = (value || '').split(/\s+/).filter(Boolean).length;
      const payload = field === 'content' ? { content: value, word_count: wordCount } : { [field]: value };
      await notesAPI.update(activeNote.id, payload);
      setNotes((list) => list.map((n) => (n.id === activeNote.id ? { ...n, ...payload } : n)));
    }, 600);
  };

  const deleteNote = async (id) => {
    await notesAPI.delete(id);
    setNotes((n) => n.filter((x) => x.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
  };

  const toggleStar = async (note) => {
    const res = await notesAPI.toggleStar(note.id);
    setNotes((n) => n.map((x) => (x.id === note.id ? { ...x, is_starred: res.data.is_starred } : x)));
    if (activeNote?.id === note.id) setActiveNote((a) => ({ ...a, is_starred: res.data.is_starred }));
  };

  const selectNote = (n) => {
    setActiveNote(n);
    setAiResult(null);
    setAskHistory([]);
    setAiPanelOpen(false);
  };

  const runAIAction = async (action) => {
    if (!activeNote) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await notesAPI[action](activeNote.id);
      setAiResult({ action, ...res.data });
    } finally {
      setAiLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!askInput.trim() || !activeNote) return;
    const q = askInput;
    setAskHistory((h) => [...h, { role: 'user', text: q }]);
    setAskInput('');
    setAiLoading(true);
    try {
      const res = await notesAPI.ask(activeNote.id, q);
      setAskHistory((h) => [...h, { role: 'assistant', text: res.data.result }]);
    } finally {
      setAiLoading(false);
    }
  };

  const aiPanelProps = { activeNote, aiLoading, aiResult, askHistory, askInput, setAskInput, runAIAction, askQuestion };

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:h-[calc(100vh-7rem)]">
      {/* Folders — horizontal scroll chip row on mobile/tablet, sidebar column on xl+ */}
      <div className="xl:w-52 xl:flex-shrink-0 bg-bg-card border border-border-primary rounded-2xl p-3 flex xl:flex-col gap-2 xl:gap-0">
        <div className="hidden xl:flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-white">Folders</h3>
          <button onClick={() => setShowFolderModal(true)} className="text-text-muted hover:text-brand-cyan"><FolderPlus size={15} /></button>
        </div>

        <button onClick={() => setShowFolderModal(true)} className="xl:hidden flex-shrink-0 p-2 rounded-lg bg-bg-tertiary text-text-muted hover:text-brand-cyan">
          <FolderPlus size={15} />
        </button>

        <div className="flex xl:flex-col gap-2 xl:gap-1 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0">
          <button
            onClick={() => setActiveFolder(null)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${!activeFolder ? 'bg-brand-blue/15 text-brand-blue-light' : 'text-text-secondary hover:bg-bg-tertiary'}`}
          >
            <StickyNote size={14} /> All notes
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${activeFolder === f.id ? 'bg-brand-blue/15 text-brand-blue-light' : 'text-text-secondary hover:bg-bg-tertiary'}`}
            >
              <span>{f.icon}</span> {f.name}
            </button>
          ))}
        </div>

        <Button icon={Plus} variant="secondary" size="sm" className="hidden xl:flex mt-auto" onClick={createNote}>New note</Button>
      </div>

      {/* Notes list — hidden on mobile/tablet once a note is open */}
      <div className={`${activeNote ? 'hidden lg:flex' : 'flex'} xl:w-72 xl:flex-shrink-0 bg-bg-card border border-border-primary rounded-2xl p-3 flex-col h-[60vh] xl:h-auto`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="input-dark pl-9 text-sm" />
          </div>
          <Button icon={Plus} size="sm" className="xl:hidden flex-shrink-0" onClick={createNote} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner size={20} /></div>
          ) : notes.length === 0 ? (
            <EmptyState icon={StickyNote} title="No notes" description="Create your first note." />
          ) : (
            notes.map((n) => (
              <button
                key={n.id}
                onClick={() => selectNote(n)}
                className={`w-full text-left p-2.5 rounded-xl border transition-colors ${
                  activeNote?.id === n.id ? 'bg-brand-blue/10 border-brand-blue/30' : 'border-transparent hover:bg-bg-tertiary'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-sm text-white font-medium truncate">{n.title}</p>
                  {n.is_starred && <Star size={11} className="fill-brand-amber text-brand-amber flex-shrink-0" />}
                </div>
                <p className="text-xs text-text-muted truncate">{n.content?.slice(0, 60) || 'No content'}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor — full width on mobile when a note is open, otherwise hidden until one is selected */}
      <div className={`${activeNote ? 'flex' : 'hidden lg:flex'} flex-1 bg-bg-card border border-border-primary rounded-2xl p-5 flex-col min-w-0 h-[70vh] xl:h-auto`}>
        {activeNote ? (
          <>
            <div className="flex items-center justify-between gap-2 mb-3">
              <button onClick={() => setActiveNote(null)} className="lg:hidden text-text-muted hover:text-white flex-shrink-0">
                <ChevronLeft size={20} />
              </button>
              <input
                value={activeNote.title}
                onChange={(e) => updateNote('title', e.target.value)}
                className="bg-transparent text-xl font-bold text-white outline-none flex-1 min-w-0"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleStar(activeNote)}>
                  <Star size={16} className={activeNote.is_starred ? 'fill-brand-amber text-brand-amber' : 'text-text-muted hover:text-brand-amber'} />
                </button>
                <button onClick={() => deleteNote(activeNote.id)} className="text-text-muted hover:text-red-400">
                  <Trash2 size={15} />
                </button>
                <button onClick={() => setAiPanelOpen(true)} className="xl:hidden text-text-muted hover:text-brand-cyan">
                  <Sparkles size={15} />
                </button>
              </div>
            </div>
            <textarea
              value={activeNote.content || ''}
              onChange={(e) => updateNote('content', e.target.value)}
              placeholder="Start writing..."
              className="flex-1 bg-transparent text-sm text-text-secondary outline-none resize-none leading-relaxed"
            />
          </>
        ) : (
          <EmptyState icon={StickyNote} title="Select or create a note" action={<Button icon={Plus} onClick={createNote}>New note</Button>} />
        )}
      </div>

      {/* AI panel — persistent column on xl+, slide-over overlay below xl */}
      {activeNote && (
        <div className="hidden xl:block xl:w-72 xl:flex-shrink-0">
          <AIPanel {...aiPanelProps} />
        </div>
      )}

      <AnimatePresence>
        {activeNote && aiPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 xl:hidden"
              onClick={() => setAiPanelOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 p-4 xl:hidden"
            >
              <AIPanel {...aiPanelProps} onClose={() => setAiPanelOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showFolderModal && <NewFolderModal onClose={() => setShowFolderModal(false)} onCreate={createFolder} />}
    </div>
  );
}
