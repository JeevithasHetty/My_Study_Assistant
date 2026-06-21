import { useState } from 'react';
import { Settings as SettingsIcon, User, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other'];

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    branch: user?.branch || '',
    year_of_study: user?.year_of_study || '',
    college_name: user?.college_name || '',
    target_role: user?.target_role || '',
    target_companies: user?.target_companies || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await usersAPI.updateProfile(form);
      setUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon size={22} className="text-text-secondary" /> Settings
        </h1>
        <p className="text-text-secondary text-sm mt-1">Manage your profile and preferences.</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-lg font-bold">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.full_name}</p>
            <p className="text-text-muted text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Full name</label>
            <input value={form.full_name} onChange={update('full_name')} className="input-dark" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Branch</label>
              <select value={form.branch} onChange={update('branch')} className="input-dark">
                <option value="">Select branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Year</label>
              <select value={form.year_of_study} onChange={update('year_of_study')} className="input-dark">
                <option value="">Select year</option>
                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">College name</label>
            <input value={form.college_name} onChange={update('college_name')} className="input-dark" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Target role</label>
              <input value={form.target_role} onChange={update('target_role')} placeholder="Software Engineer" className="input-dark" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Target companies</label>
              <input value={form.target_companies} onChange={update('target_companies')} placeholder="Google, Microsoft..." className="input-dark" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">LinkedIn URL</label>
              <input value={form.linkedin_url} onChange={update('linkedin_url')} placeholder="linkedin.com/in/..." className="input-dark" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">GitHub URL</label>
              <input value={form.github_url} onChange={update('github_url')} placeholder="github.com/..." className="input-dark" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} loading={saving} icon={Save}>Save changes</Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-brand-green-light">
                <CheckCircle2 size={15} /> Saved
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
