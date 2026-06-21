import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, FileText, Target, Calendar, BookOpen, Video, FileSearch,
  Send, Sparkles, ChevronRight, Loader2, CheckCircle2, Circle,
} from 'lucide-react';
import { careerCoachAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, EmptyState } from '../../components/common/Shared';

const ICON_MAP = { FileText, Target, Calendar, BookOpen, Video, FileSearch, Brain };
const COLOR_MAP = {
  blue: { bg: 'bg-brand-blue/10', text: 'text-brand-blue-light', ring: 'ring-brand-blue/30' },
  purple: { bg: 'bg-brand-purple/10', text: 'text-violet-300', ring: 'ring-brand-purple/30' },
  green: { bg: 'bg-brand-green/10', text: 'text-brand-green-light', ring: 'ring-brand-green/30' },
  cyan: { bg: 'bg-brand-cyan/10', text: 'text-brand-cyan', ring: 'ring-brand-cyan/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-red-500/30' },
  amber: { bg: 'bg-brand-amber/10', text: 'text-brand-amber', ring: 'ring-brand-amber/30' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', ring: 'ring-pink-500/30' },
};

function AgentCard({ id, agent, onSelect, isSelected }) {
  const Icon = ICON_MAP[agent.icon] || Brain;
  const c = COLOR_MAP[agent.color] || COLOR_MAP.blue;
  const insight = agent.insight || {};

  return (
    <Card
      onClick={() => onSelect(id)}
      className={`!p-4 cursor-pointer ${isSelected ? `ring-1 ${c.ring}` : ''} ${agent.is_manager ? 'border-brand-blue/30' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.text} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`relative w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-brand-green' : 'bg-text-muted'}`}>
            {agent.status === 'active' && <div className="absolute inset-0 rounded-full bg-brand-green status-pulse" />}
          </div>
          <span className="text-[10px] text-text-muted capitalize">{agent.status}</span>
        </div>
      </div>
      <h4 className="text-white font-semibold text-sm mb-1">{agent.name}</h4>
      {agent.is_manager && <Badge color="blue" className="mb-2">Manager Agent</Badge>}
      <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">
        {insight.next_action || insight.priority_action || insight.overall_assessment || 'Analyzing your profile...'}
      </p>
    </Card>
  );
}

function AgentDetail({ agentKey, agent }) {
  if (!agent) return null;
  const insight = agent.insight || {};
  const entries = Object.entries(insight).filter(([k]) => k !== 'next_action');

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} className="text-brand-cyan" />
        <h3 className="text-white font-semibold text-sm">{agent.name} — full insight</h3>
      </div>
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key} className="border-b border-border-primary pb-3 last:border-0">
            <p className="text-xs font-medium text-text-muted capitalize mb-1">{key.replace(/_/g, ' ')}</p>
            {Array.isArray(value) ? (
              <div className="flex flex-wrap gap-1.5">
                {value.map((v, i) => (
                  <Badge key={i} color="blue">
                    {typeof v === 'object' ? (v.name || v.skill || v.goal || JSON.stringify(v)) : v}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white">{String(value)}</p>
            )}
          </div>
        ))}
        {insight.next_action && (
          <div className="bg-brand-blue/10 border border-brand-blue/25 rounded-xl p-3 flex items-start gap-2 mt-2">
            <ChevronRight size={14} className="text-brand-blue-light flex-shrink-0 mt-0.5" />
            <p className="text-sm text-brand-blue-light font-medium">{insight.next_action}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function CareerCoachPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('career_coach');
  const [weeklyGoals, setWeeklyGoals] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your Career Coach. Ask me anything about your placement prep, study plan, or career direction." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    careerCoachAPI.getInsights().then((res) => setInsights(res.data)).finally(() => setLoading(false));
    careerCoachAPI.getWeeklyGoals().then((res) => setWeeklyGoals(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await careerCoachAPI.chat(userMsg, selected);
      setChatMessages((m) => [...m, { role: 'assistant', text: res.data.response }]);
    } catch {
      setChatMessages((m) => [...m, { role: 'assistant', text: "I couldn't process that right now. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
        <p className="text-text-secondary text-sm">Running 7 agents on your profile...</p>
      </div>
    );
  }

  const agents = insights?.agents || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain size={22} className="text-brand-blue-light" /> AI Career Coach
        </h1>
        <p className="text-text-secondary text-sm mt-1">Seven specialized agents working together on your academic & career success.</p>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(agents).map(([key, agent]) => (
          <AgentCard key={key} id={key} agent={agent} onSelect={setSelected} isSelected={selected === key} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Selected agent detail */}
        <div className="lg:col-span-2 space-y-5">
          <AgentDetail agentKey={selected} agent={agents[selected]} />

          {/* Weekly goals */}
          {weeklyGoals && (
            <Card>
              <h3 className="text-white font-semibold text-sm mb-1">{weeklyGoals.week_theme || 'This week\'s goals'}</h3>
              <div className="space-y-2 mt-3">
                {(weeklyGoals.goals || []).map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-bg-tertiary">
                    <Circle size={14} className="text-brand-blue-light flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{g.goal}</p>
                      <p className="text-xs text-text-muted">{g.target}</p>
                    </div>
                    <Badge color={g.priority === 'high' ? 'red' : g.priority === 'medium' ? 'amber' : 'gray'}>
                      {g.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Chat with agent */}
        <Card className="flex flex-col h-[560px] !p-0">
          <div className="p-4 border-b border-border-primary flex items-center gap-2">
            <Sparkles size={14} className="text-brand-cyan" />
            <span className="text-sm font-semibold text-white">
              Chat with {agents[selected]?.name || 'Career Coach'}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user' ? 'bg-brand-blue text-white' : 'bg-bg-tertiary text-text-secondary'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-bg-tertiary px-3.5 py-2.5 rounded-2xl">
                  <Loader2 size={14} className="animate-spin text-brand-cyan" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-border-primary flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your career coach..."
              className="input-dark flex-1"
            />
            <Button onClick={sendMessage} icon={Send} size="md" loading={chatLoading} />
          </div>
        </Card>
      </div>
    </div>
  );
}
