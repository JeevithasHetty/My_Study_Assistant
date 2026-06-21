import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other'];

export default function SignupPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', username: '', password: '',
    branch: '', year_of_study: '', target_role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    console.log("Register payload:", form);

    // Create account
    await register(form);

    // Redirect to login page
    navigate('/login');

    // OR show success message if you have a toast system
    // alert("Account created successfully. Please login.");

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    console.error("RESPONSE:", err.response);
    console.error("DATA:", err.response?.data);

    setError(
      err.response?.data?.detail ||
      err.message ||
      'Could not create account. Please check your details.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-bg-primary bg-grid-pattern flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center shadow-glow-blue">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">StudentOS <span className="text-brand-cyan">AI</span></span>
        </Link>

        <div className="bg-bg-card border border-border-primary rounded-2xl p-8 shadow-card">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-text-secondary text-sm mb-6">Start your AI-powered academic & career journey</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2.5 rounded-xl mb-4">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Full name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input required value={form.full_name} onChange={update('full_name')} placeholder="Jane Doe" className="input-dark pl-10" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Username</label>
                <input required value={form.username} onChange={update('username')} placeholder="janedoe23" className="input-dark" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" required value={form.email} onChange={update('email')} placeholder="you@college.edu" className="input-dark pl-10" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="At least 6 characters"
                  className="input-dark pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Target role</label>
              <div className="relative">
                <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={form.target_role} onChange={update('target_role')} placeholder="Software Engineer" className="input-dark pl-10" />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" loading={loading} icon={!loading && ArrowRight}>
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-cyan font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
