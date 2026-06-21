import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FileText, Loader2, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, Briefcase, Sparkles, ArrowRight, Map,
} from 'lucide-react';
import { resumeAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge, ProgressBar, EmptyState } from '../../components/common/Shared';

function ScoreRing({ score }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-32 h-32">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r="54" fill="none" stroke="#1E293B" strokeWidth="10" />
        <motion.circle
          cx="64" cy="64" r="54" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-text-muted">ATS SCORE</span>
      </div>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [jd, setJd] = useState('');
  const [jdResult, setJdResult] = useState(null);
  const [jdLoading, setJdLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    resumeAPI.getAll().then((res) => {
      setResumes(res.data);
      if (res.data.length > 0) loadAnalysis(res.data[0]);
    });
  }, []);

  const loadAnalysis = async (resume) => {
    setActiveResume(resume);
    setAnalysis(null);
    setAnalyzing(true);
    setError('');
    try {
      const res = await resumeAPI.getAnalysis(resume.id);
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not analyze this resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await resumeAPI.upload(file);
      const newResumes = await resumeAPI.getAll();
      setResumes(newResumes.data);
      const uploaded = newResumes.data.find((r) => r.id === res.data.resume_id) || newResumes.data[0];
      await loadAnalysis(uploaded);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try a PDF, DOC, or DOCX file.');
    } finally {
      setUploading(false);
    }
  };

  const handleJdAnalyze = async () => {
    if (!jd.trim() || !activeResume) return;
    setJdLoading(true);
    try {
      const res = await resumeAPI.analyzeJD(activeResume.id, jd);
      setJdResult(res.data);
    } finally {
      setJdLoading(false);
    }
  };

  const handleRoadmap = async () => {
    if (!activeResume) return;
    const res = await resumeAPI.getRoadmap(activeResume.id);
    setRoadmap(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={22} className="text-brand-blue-light" /> Resume Analyzer
          </h1>
          <p className="text-text-secondary text-sm mt-1">Get an instant ATS score and skill-gap breakdown.</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => handleUpload(e.target.files[0])} />
        <Button icon={Upload} onClick={() => fileRef.current?.click()} loading={uploading}>
          Upload resume
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {resumes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => loadAnalysis(r)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                activeResume?.id === r.id
                  ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-blue-light'
                  : 'bg-bg-tertiary border-border-primary text-text-secondary hover:text-white'
              }`}
            >
              {r.filename.replace(/^resume_\d+_/, '')}
            </button>
          ))}
        </div>
      )}

      {resumes.length === 0 && !uploading ? (
        <Card>
          <EmptyState
            icon={Upload}
            title="No resume uploaded yet"
            description="Upload your resume as a PDF, DOC, or DOCX to get an instant ATS score and personalized improvement suggestions."
            action={<Button icon={Upload} onClick={() => fileRef.current?.click()}>Upload resume</Button>}
          />
        </Card>
      ) : analyzing ? (
        <Card className="flex flex-col items-center py-16 gap-3">
          <Loader2 size={28} className="animate-spin text-brand-blue" />
          <p className="text-text-secondary text-sm">Analyzing your resume with AI...</p>
        </Card>
      ) : analysis ? (
        <>
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Score + skills */}
            <Card className="flex flex-col items-center text-center">
              <ScoreRing score={analysis.ats_score} />
              <p className="text-text-secondary text-sm mt-4">
                {analysis.ats_score >= 75 ? 'Strong resume — minor tweaks needed' : analysis.ats_score >= 50 ? 'Decent start — room to improve' : 'Needs significant work'}
              </p>
            </Card>

            <Card>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-brand-green" /> Present skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.present_skills || []).map((s, i) => <Badge key={i} color="green">{s}</Badge>)}
                {(!analysis.present_skills || analysis.present_skills.length === 0) && (
                  <p className="text-xs text-text-muted">No skills detected</p>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
                <XCircle size={14} className="text-red-400" /> Missing skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.missing_skills || []).map((s, i) => <Badge key={i} color="red">{s}</Badge>)}
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Suggestions */}
            <Card>
              <h3 className="text-white font-semibold text-sm mb-3">Suggestions</h3>
              <div className="space-y-2.5">
                {(analysis.suggestions || []).map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {s.type === 'success' ? <CheckCircle2 size={15} className="text-brand-green flex-shrink-0 mt-0.5" /> :
                     s.type === 'warning' ? <AlertCircle size={15} className="text-brand-amber flex-shrink-0 mt-0.5" /> :
                     <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />}
                    <p className="text-sm text-text-secondary">{s.text || s}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Section scores */}
            <Card>
              <h3 className="text-white font-semibold text-sm mb-3">Section breakdown</h3>
              <div className="space-y-3">
                {Object.entries(analysis.section_scores || {}).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{val}%</span>
                    </div>
                    <ProgressBar value={val} color={val >= 70 ? 'green' : val >= 40 ? 'amber' : 'blue'} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Job matches */}
          <Card>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
              <Briefcase size={14} className="text-brand-blue-light" /> Job matches
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(analysis.job_matches || []).map((j, i) => (
                <div key={i} className="bg-bg-tertiary border border-border-primary rounded-xl p-3.5">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-white text-sm font-medium">{j.company}</p>
                    <span className="text-xs font-bold text-brand-cyan">{j.match}%</span>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{j.role}</p>
                  <ProgressBar value={j.match} height="h-1" />
                </div>
              ))}
            </div>
          </Card>

          {/* JD matching */}
          <Card>
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-cyan" /> Match against a job description
            </h3>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste a job description here..."
              rows={4}
              className="input-dark resize-none mb-3"
            />
            <Button onClick={handleJdAnalyze} loading={jdLoading} icon={ArrowRight} size="sm">
              Compare
            </Button>

            {jdResult && (
              <div className="mt-4 pt-4 border-t border-border-primary">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-white">{jdResult.match_score}%</span>
                  <span className="text-text-secondary text-sm">match score</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-text-muted mb-1.5">Matching skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(jdResult.matching_skills || []).map((s, i) => <Badge key={i} color="green">{s}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-muted mb-1.5">Missing for this role</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(jdResult.missing_skills || []).map((s, i) => <Badge key={i} color="red">{s}</Badge>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Career roadmap */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                <Map size={14} className="text-brand-purple" /> Career roadmap
              </h3>
              {!roadmap && <Button onClick={handleRoadmap} size="sm" variant="secondary">Generate</Button>}
            </div>
            {roadmap && (
              <div className="space-y-3">
                {(roadmap.phases || []).map((p, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center text-xs font-bold text-brand-blue-light flex-shrink-0">
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
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
