import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target, TrendingUp, Send, Loader2, Building2, CheckCircle2, Map,
} from 'lucide-react';
import { placementAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, ProgressBar, EmptyState } from '../../components/common/Shared';

const TIER_COLOR = { Target: 'green', Reach: 'amber', Stretch: 'purple', Dream: 'red' };

export default function PlacementReadinessPage() {
  const [readiness, setReadiness] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hi! I'm your placement mentor. Ask me about company prep, interview strategy, or your readiness score." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      placementAPI.getReadiness(),
      placementAPI.getSkillGaps(),
      placementAPI.getRoadmap(),
    ]).then(([r, g, rm]) => {
      setReadiness(r.data);
      setGaps(Array.isArray(g.data) ? g.data : []);
      setRoadmap(rm.data);
    }).finally(() => setLoading(false));
  }, []);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatHistory((h) => [...h, { role: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await placementAPI.chat(msg);
      setChatHistory((h) => [...h, { role: 'assistant', text: res.data.response }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-brand-blue" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target size={22} className="text-violet-300" /> Placement Readiness
        </h1>
        <p className="text-text-secondary text-sm mt-1">Where you stand, what's missing, and how to close the gap.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="flex flex-col items-center text-center">
          <div className="relative w-32 h-32 mb-2">
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r="54" fill="none" stroke="#1E293B" strokeWidth="10" />
              <motion.circle
                cx="64" cy="64" r="54" fill="none" stroke="#8B5CF6" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 54}
                initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - (readiness?.overall_score || 0) / 100) }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{readiness?.overall_score || 0}</span>
              <span className="text-[10px] text-text-muted">READINESS</span>
            </div>
          </div>
          <p className="text-text-secondary text-sm">Overall placement readiness</p>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-brand-green" /> Skills you've got
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(readiness?.completed_skills || []).map((s, i) => (
              <Badge key={i} color="green">{s.name} · {s.level}%</Badge>
            ))}
            {(!readiness?.completed_skills || readiness.completed_skills.length === 0) && (
              <p className="text-xs text-text-muted">Upload a resume to see your skills mapped here.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Skill gaps */}
      <Card>
        <h3 className="text-white font-semibold text-sm mb-4">Skill gaps to close</h3>
        <div className="space-y-3">
          {gaps.map((g, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white">{g.skill}</span>
                <Badge color={g.priority === 'critical' ? 'red' : g.priority === 'high' ? 'amber' : 'gray'}>{g.priority}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar value={g.current_level} max={100} color="purple" className="flex-1" />
                <span className="text-xs text-text-muted w-16 text-right">{g.current_level}→{g.required_level}</span>
              </div>
            </div>
          ))}
          {gaps.length === 0 && <EmptyState icon={Target} title="No gaps identified yet" />}
        </div>
      </Card>

      {/* Company readiness */}
      {readiness?.company_readiness?.length > 0 && (
        <Card>
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-1.5">
            <Building2 size={14} className="text-brand-blue-light" /> Company readiness
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {readiness.company_readiness.map((c, i) => (
              <div key={i} className="bg-bg-tertiary border border-border-primary rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white text-sm font-medium">{c.company}</p>
                  <Badge color={TIER_COLOR[c.tier] || 'gray'}>{c.tier}</Badge>
                </div>
                <p className="text-xs text-text-muted mb-2">{c.role}</p>
                <div className="flex items-center gap-2">
                  <ProgressBar value={c.match} height="h-1" className="flex-1" />
                  <span className="text-xs font-bold text-brand-cyan">{c.match}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Roadmap */}
      {roadmap && (
        <Card>
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-1.5">
            <Map size={14} className="text-brand-purple" /> Preparation roadmap
          </h3>
          <div className="space-y-3">
            {(roadmap.phases || []).map((p, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  p.status === 'active' ? 'bg-brand-blue/20 border border-brand-blue/40 text-brand-blue-light' : 'bg-bg-tertiary border border-border-primary text-text-muted'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 pb-3 border-b border-border-primary last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white">{p.phase}</p>
                    <Badge color="gray">{p.duration}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mb-1.5">{p.focus}</p>
                  <ul className="text-xs text-text-muted space-y-0.5">
                    {(p.tasks || []).map((t, j) => <li key={j}>• {t}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Coach chat */}
      <Card className="!p-0">
        <div className="p-4 border-b border-border-primary flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-cyan" />
          <span className="text-sm font-semibold text-white">Ask your Placement Mentor</span>
        </div>
        <div className="p-4 max-h-72 overflow-y-auto space-y-3">
          {chatHistory.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-brand-blue text-white' : 'bg-bg-tertiary text-text-secondary'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {chatLoading && <Loader2 size={14} className="animate-spin text-brand-cyan" />}
        </div>
        <div className="p-3 border-t border-border-primary flex gap-2">
          <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="Ask about placements..." className="input-dark flex-1" />
          <Button onClick={sendChat} icon={Send} loading={chatLoading} />
        </div>
      </Card>
    </div>
  );
}
