import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Loader2, BookOpen, Brain, HelpCircle, Layers,
  Send, Video, Clock, ChevronLeft, ChevronRight, RotateCw,
} from 'lucide-react';
import { documentsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, EmptyState } from '../../components/common/Shared';

const TABS = [
  { key: 'summary', label: 'Summary', icon: FileText },
  { key: 'concepts', label: 'Topics', icon: Layers },
  { key: 'flashcards', label: 'Flashcards', icon: Brain },
  { key: 'mcqs', label: 'MCQs', icon: HelpCircle },
  { key: 'qa', label: 'Ask', icon: Send },
  { key: 'youtube', label: 'Videos', icon: Video },
];

function FlashcardViewer({ cards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards?.length) return <EmptyState icon={Brain} title="No flashcards generated" />;
  const card = cards[idx];

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-md h-52 cursor-pointer relative"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-blue/15 to-bg-tertiary border border-brand-blue/25 rounded-2xl flex items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-white font-medium">{card.front}</p>
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-br from-brand-cyan/15 to-bg-tertiary border border-brand-cyan/25 rounded-2xl flex items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-text-secondary text-sm">{card.back}</p>
          </div>
        </motion.div>
      </div>
      <p className="text-xs text-text-muted mt-3">Click card to flip · {idx + 1} / {cards.length}</p>
      <div className="flex gap-3 mt-3">
        <button onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }} className="p-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-white">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => { setIdx(Math.min(cards.length - 1, idx + 1)); setFlipped(false); }} className="p-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-white">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function MCQQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  if (!questions?.length) return <EmptyState icon={HelpCircle} title="No MCQs generated" />;

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="bg-bg-tertiary border border-border-primary rounded-xl p-4">
          <p className="text-sm font-medium text-white mb-3">{qi + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = oi === q.correct_answer;
              const showResult = answers[qi] !== undefined;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    showResult && isCorrect ? 'bg-brand-green/15 border-brand-green/40 text-brand-green-light' :
                    showResult && selected && !isCorrect ? 'bg-red-500/15 border-red-500/40 text-red-400' :
                    'bg-bg-card border-border-primary text-text-secondary hover:border-brand-blue/30'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {answers[qi] !== undefined && q.explanation && (
            <p className="text-xs text-text-muted mt-2 italic">{q.explanation}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DocumentTutorPage() {
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [tab, setTab] = useState('summary');
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState({});
  const [tabLoading, setTabLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    documentsAPI.getAll().then((res) => {
      setDocuments(res.data);
      if (res.data.length > 0) setActiveDoc(res.data[0]);
    });
  }, []);

  useEffect(() => {
    if (activeDoc && tab !== 'qa') loadTabContent();
  }, [activeDoc, tab]);

  const loadTabContent = async () => {
    if (!activeDoc) return;
    setTabLoading(true);
    try {
      let res;
      if (tab === 'summary') res = await documentsAPI.getSummary(activeDoc.id);
      else if (tab === 'concepts') res = await documentsAPI.getConcepts(activeDoc.id);
      else if (tab === 'flashcards') res = await documentsAPI.getFlashcards(activeDoc.id);
      else if (tab === 'mcqs') res = await documentsAPI.getMCQs(activeDoc.id);
      else if (tab === 'youtube') res = await documentsAPI.getYouTube(activeDoc.id);
      setContent((c) => ({ ...c, [`${activeDoc.id}-${tab}`]: res.data }));
    } catch {
      // ignore
    } finally {
      setTabLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      await documentsAPI.upload(file);
      const res = await documentsAPI.getAll();
      setDocuments(res.data);
      setActiveDoc(res.data[0]);
      setContent({});
      setTab('summary');
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || !activeDoc) return;
    const q = question;
    setQaHistory((h) => [...h, { role: 'user', text: q }]);
    setQuestion('');
    setQaLoading(true);
    try {
      const res = await documentsAPI.ask(activeDoc.id, q);
      setQaHistory((h) => [...h, { role: 'assistant', text: res.data.answer }]);
    } finally {
      setQaLoading(false);
    }
  };

  const current = content[`${activeDoc?.id}-${tab}`];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen size={22} className="text-brand-cyan" /> Document Tutor
          </h1>
          <p className="text-text-secondary text-sm mt-1">Upload a PDF and let AI turn it into summaries, flashcards, and quizzes.</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf" hidden onChange={(e) => handleUpload(e.target.files[0])} />
        <Button icon={Upload} onClick={() => fileRef.current?.click()} loading={uploading}>Upload PDF</Button>
      </div>

      {documents.length === 0 && !uploading ? (
        <Card>
          <EmptyState
            icon={Upload}
            title="No documents uploaded"
            description="Upload lecture notes, textbook chapters, or any PDF to get instant summaries, flashcards, and Q&A."
            action={<Button icon={Upload} onClick={() => fileRef.current?.click()}>Upload PDF</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {documents.map((d) => (
              <button
                key={d.id}
                onClick={() => { setActiveDoc(d); setTab('summary'); }}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  activeDoc?.id === d.id
                    ? 'bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan'
                    : 'bg-bg-tertiary border-border-primary text-text-secondary hover:text-white'
                }`}
              >
                <FileText size={12} /> {d.original_filename}
              </button>
            ))}
          </div>

          {activeDoc && (
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><FileText size={12} /> {activeDoc.pages || '—'} pages</span>
              <span className="flex items-center gap-1"><Clock size={12} /> ~{activeDoc.estimated_study_hours || '—'}h study time</span>
            </div>
          )}

          <Card className="!p-0">
            <div className="flex border-b border-border-primary overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    tab === t.key ? 'border-brand-blue text-white' : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tabLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-brand-blue" />
                </div>
              ) : tab === 'summary' ? (
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{current?.summary || 'No summary yet.'}</p>
              ) : tab === 'concepts' ? (
                <div className="flex flex-wrap gap-2">
                  {(current?.concepts || []).map((c, i) => <Badge key={i} color="blue">{c}</Badge>)}
                </div>
              ) : tab === 'flashcards' ? (
                <FlashcardViewer cards={current?.flashcards} />
              ) : tab === 'mcqs' ? (
                <MCQQuiz questions={current?.questions} />
              ) : tab === 'youtube' ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {(current?.videos || []).map((v, i) => (
                    <a key={i} href={v.url} target="_blank" rel="noreferrer" className="flex gap-3 bg-bg-tertiary border border-border-primary rounded-xl p-3 hover:border-brand-blue/30">
                      <div className="w-20 h-14 rounded-lg bg-bg-card flex items-center justify-center flex-shrink-0">
                        <Video size={18} className="text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{v.title}</p>
                        <p className="text-xs text-text-muted truncate">{v.channel}</p>
                      </div>
                    </a>
                  ))}
                  {(!current?.videos || current.videos.length === 0) && (
                    <EmptyState icon={Video} title="No videos found" />
                  )}
                </div>
              ) : tab === 'qa' ? (
                <div className="flex flex-col h-96">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                    {qaHistory.length === 0 && (
                      <p className="text-text-muted text-sm text-center py-8">Ask anything about this document.</p>
                    )}
                    {qaHistory.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                          m.role === 'user' ? 'bg-brand-blue text-white' : 'bg-bg-tertiary text-text-secondary'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {qaLoading && <Loader2 size={16} className="animate-spin text-brand-cyan" />}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                      placeholder="Ask a question about this document..."
                      className="input-dark flex-1"
                    />
                    <Button onClick={askQuestion} icon={Send} loading={qaLoading} />
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
