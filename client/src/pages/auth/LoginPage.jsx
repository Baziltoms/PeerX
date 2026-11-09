import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BookOpen,
  Award,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const LoginPage = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('alan@gmail.com');
  const [password, setPassword] = useState('1234567890');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const roleConfigs = [
    { key: 'student', label: 'Student', icon: GraduationCap },
    { key: 'faculty', label: 'Faculty', icon: Users },
    { key: 'admin', label: 'Admin', icon: Building },
    { key: 'company', label: 'Recruiter', icon: Briefcase },
  ];

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    const demo = DEMO_ACCOUNTS[selectedRole];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password, role);
      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate(`/${role}/dashboard`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Left Feature Showcase Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-heading font-black text-xl shadow-lg shadow-indigo-500/30">
              PX
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">PeerX</span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/20">
                v1.0
              </span>
            </div>
          </div>

          <div className="mt-16 space-y-6">
            <h1 className="text-4xl xl:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              Academic Management, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                Peer Learning & Recruitment
              </span>
            </h1>
            <p className="text-sm text-indigo-100/80 max-w-lg leading-relaxed font-medium">
              Unified platform connecting students, faculty, college administration, and recruiters into a seamlessly synchronized academic ecosystem.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-4 my-8 relative z-10">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:border-white/30 transition-all">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 text-indigo-200 flex items-center justify-center mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">P2P Skill Exchange</h4>
            <p className="text-[11px] text-indigo-200/80 font-medium">Peer-led skill courses and project collaborations.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:border-white/30 transition-all">
            <div className="w-8 h-8 rounded-xl bg-purple-500/30 text-purple-200 flex items-center justify-center mb-2">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Recruiter Pipeline</h4>
            <p className="text-[11px] text-indigo-200/80 font-medium">Direct talent matching with industry opportunities.</p>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 bg-slate-50/60">
        <div className="w-full max-w-md">
          {/* Mobile Header Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-heading font-extrabold text-2xl shadow-md shadow-indigo-200 mb-3">
              PX
            </div>
            <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">PeerX Portal Login</h2>
            <p className="text-xs text-slate-500 mt-1">Academic & Talent Ecosystem</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80">
            <div className="mb-6">
              <h3 className="text-lg font-heading font-bold text-slate-900">Sign In to Your Account</h3>

            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 mb-6">
              {roleConfigs.map((rc) => {
                const Icon = rc.icon;
                const isSelected = role === rc.key;
                return (
                  <button
                    key={rc.key}
                    type="button"
                    onClick={() => handleRoleChange(rc.key)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60'
                      }`}
                  >
                    <Icon className="w-4 h-4 mb-0.5" />
                    <span>{rc.label}</span>
                  </button>
                );
              })}
            </div>



            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="firstname@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5"
              >
                {loading ? (
                  'Authenticating...'
                ) : (
                  <>
                    <span>Enter {roleConfigs.find((r) => r.key === role)?.label} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <Link to="/register-admin" className="hover:text-indigo-600 transition-colors">
                Register New College
              </Link>
              <Link to="/register-company" className="hover:text-violet-600 transition-colors">
                Recruiter Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

