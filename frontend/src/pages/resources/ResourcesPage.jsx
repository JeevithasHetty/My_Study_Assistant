import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video, Star, Bookmark, BookmarkCheck, Search, Sparkles, ExternalLink, Loader2,
} from 'lucide-react';
import { resourcesAPI } from '../../services/api';
import Card from '../../components/common/Card';
import { Badge, EmptyState } from '../../components/common/Shared';

const CATEGORIES = ['All', 'DSA', 'System Design', 'OS', 'DBMS', 'CN', 'Placement', 'Projects'];

function ResourceCard({ r, onToggleSave }) {
  return (
    <Card className="!p-4 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <Badge color="blue">{r.category}</Badge>
        <button onClick={() => onToggleSave(r)}>
          {r.saved ? <BookmarkCheck size={15} className="text-brand-cyan" /> : <Bookmark size={15} className="text-text-muted hover:text-white" />}
        </button>
      </div>
      <h4 className="text-white font-semibold text-sm mb-1">{r.title}</h4>
      <p className="text-text-secondary text-xs mb-3 flex-1 leading-relaxed">{r.desc}</p>
      <div className="flex items-center justify-between text-xs text-text-muted mb-3">
        <span className="flex items-center gap-1"><Star size={11} className="fill-brand-amber text-brand-amber" /> {r.rating}</span>
        <span>{r.views} views</span>
        <span>{r.source}</span>
      </div>
      {r.tag && <Badge color="amber" className="mb-3 w-fit">{r.tag}</Badge>}
      <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 text-xs font-medium bg-bg-tertiary border border-border-primary rounded-lg py-2 text-text-secondary hover:text-white hover:border-brand-blue/30 transition-colors">
        Open resource <ExternalLink size={11} />
      </a>
    </Card>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [aiCurated, setAiCurated] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [category, search]);

  useEffect(() => {
    resourcesAPI.getAICurated().then((res) => setAiCurated(res.data)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    resourcesAPI.getAll(params).then((res) => setResources(res.data)).finally(() => setLoading(false));
  };

  const toggleSave = async (r) => {
    if (r.saved) {
      await resourcesAPI.unsave(r.id);
    } else {
      await resourcesAPI.save(r.id);
    }
    setResources((list) => list.map((x) => (x.id === r.id ? { ...x, saved: !x.saved } : x)));
    setAiCurated((list) => list.map((x) => (x.id === r.id ? { ...x, saved: !x.saved } : x)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Video size={22} className="text-red-400" /> Resources
        </h1>
        <p className="text-text-secondary text-sm mt-1">Curated courses, videos, and practice platforms.</p>
      </div>

      {aiCurated.length > 0 && (
        <Card>
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand-cyan" /> AI-curated for your skill gaps
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiCurated.map((r) => <ResourceCard key={r.id} r={r} onToggleSave={toggleSave} />)}
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="input-dark pl-9" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              category === c ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-blue-light' : 'bg-bg-tertiary border-border-primary text-text-secondary hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-brand-blue" /></div>
      ) : resources.length === 0 ? (
        <EmptyState icon={Search} title="No resources found" description="Try a different category or search term." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => <ResourceCard key={r.id} r={r} onToggleSave={toggleSave} />)}
        </div>
      )}
    </div>
  );
}
