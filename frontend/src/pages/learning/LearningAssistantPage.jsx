import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Search, Loader2, BookOpen, HelpCircle,
  Briefcase, GitBranch, Sparkles, TrendingUp,
} from 'lucide-react';
import { learningAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, EmptyState } from '../../components/common/Shared';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TABS = [
  { key: 'explain', label: 'Explain', icon: BookOpen },
  { key: 'practice', label: 'Practice', icon: HelpCircle },
  { key: 'interview', label: 'Interview', icon: Briefcase },
  { key: 'related', label: 'Related topics', icon: GitBranch },
  { key: 'career', label: 'Career relevance', icon: TrendingUp },
];

export default function LearningAssistantPage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [tab, setTab] = useState('explain');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const handleSearch = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      let res;
      if (tab === 'explain') res = await learningAPI.explain(topic, difficulty);
      else if (tab === 'practice') res = await learningAPI.practiceQuestions(topic, difficulty);
      else if (tab === 'interview') res = await learningAPI.interviewQuestions(topic);
      else if (tab === 'related') res = await learningAPI.relatedTopics(topic);
      else if (tab === 'career') res = await learningAPI.careerRelevance(topic);
      setResults((r) => ({ ...r, [tab]: res.data }));
    } finally {
      setLoading(false);
    }
  };

  const switchTab = async (newTab) => {
    setTab(newTab);
    if (!topic.trim() || results[newTab]) return;
    setLoading(true);
    try {
      let res;
      if (newTab === 'explain') res = await learningAPI.explain(topic, difficulty);
      else if (newTab === 'practice') res = await learningAPI.practiceQuestions(topic, difficulty);
      else if (newTab === 'interview') res = await learningAPI.interviewQuestions(topic);
      else if (newTab === 'related') res = await learningAPI.relatedTopics(topic);
      else if (newTab === 'career') res = await learningAPI.careerRelevance(topic);
      setResults((r) => ({ ...r, [newTab]: res.data }));
    } finally {
      setLoading(false);
    }
  };

  const current = results[tab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GraduationCap size={22} className="text-brand-cyan" /> Learning Assistant
        </h1>
        <p className="text-text-secondary text-sm mt-1">Explain any concept, generate practice questions, and prep for interviews.</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Binary Search Trees, REST APIs, Operating System Deadlocks..."
              className="input-dark pl-10"
            />
          </div>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-dark sm:w-32">
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button onClick={handleSearch} loading={loading} icon={Sparkles}>Learn</Button>
        </div>
      </Card>

      <Card className="!p-0">
        <div className="flex border-b border-border-primary overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key ? 'border-brand-blue text-white' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-brand-blue" />
            </div>
          ) : !topic.trim() ? (
            <EmptyState icon={Search} title="Search for a topic to get started" description="Try something like 'dynamic programming' or 'database normalization'." />
          ) : tab === 'explain' && current ? (
            <div className="prose-sm text-text-secondary text-sm leading-relaxed whitespace-pre-line">{current.explanation}</div>
          ) : tab === 'practice' && current ? (
            <div className="space-y-3">
              {(current.questions || []).map((q, i) => (
                <details key={i} className="bg-bg-tertiary border border-border-primary rounded-xl p-4 group">
                  <summary className="text-sm font-medium text-white cursor-pointer flex items-center justify-between">
                    <span>{i + 1}. {q.question}</span>
                    <Badge color="gray">{q.type}</Badge>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-border-primary space-y-2">
                    {q.hint && <p className="text-xs text-brand-amber"><strong>Hint:</strong> {q.hint}</p>}
                    <p className="text-xs text-text-secondary"><strong className="text-white">Answer:</strong> {q.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          ) : tab === 'interview' && current ? (
            <div className="space-y-3">
              {(current.questions || []).map((q, i) => (
                <details key={i} className="bg-bg-tertiary border border-border-primary rounded-xl p-4">
                  <summary className="text-sm font-medium text-white cursor-pointer flex items-center justify-between gap-2">
                    <span>{i + 1}. {q.question}</span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Badge color={q.difficulty === 'hard' ? 'red' : q.difficulty === 'medium' ? 'amber' : 'green'}>{q.difficulty}</Badge>
                    </div>
                  </summary>
                  <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-border-primary">{q.expected_answer}</p>
                </details>
              ))}
            </div>
          ) : tab === 'related' && current ? (
            <div className="space-y-2.5">
              {(current.topics || []).map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-bg-tertiary rounded-xl">
                  <Badge color={t.priority === 'essential' ? 'red' : t.priority === 'recommended' ? 'amber' : 'gray'}>
                    {t.priority}
                  </Badge>
                  <div>
                    <p className="text-sm text-white font-medium">{t.topic}</p>
                    <p className="text-xs text-text-muted">{t.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : tab === 'career' && current ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-white">{current.relevance_score}<span className="text-sm text-text-muted">/100</span></div>
                <Badge color={current.interview_frequency?.includes('very') ? 'red' : 'amber'}>{current.interview_frequency}</Badge>
              </div>
              <p className="text-text-secondary text-sm">{current.summary}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1.5">Used at</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(current.used_in_companies || []).map((c, i) => <Badge key={i} color="blue">{c}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1.5">Career paths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(current.career_paths || []).map((c, i) => <Badge key={i} color="purple">{c}</Badge>)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
