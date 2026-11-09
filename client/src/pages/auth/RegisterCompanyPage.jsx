import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Building2, Mail, Lock, User, Globe, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const RegisterCompanyPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    registrationNumber: '',
    industry: 'Enterprise Software & Cloud Platforms',
    website: '',
    city: 'Bengaluru',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/register-company', formData);
      const { token, user } = res.data;
      localStorage.setItem('peerx_token', token);
      localStorage.setItem('peerx_user', JSON.stringify(user));
      setUser(user);
      showToast('Company account registered successfully!', 'success');
      navigate('/company/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900">
                Company Onboarding & Recruiter Portal
              </h2>
              <p className="text-xs text-slate-500">
                Register corporate credentials to discover verified college engineering talent
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verified Corporate Onboarding:</strong> Enter your official corporate registration number (CIN / LLPIN) to access students who opted into campus recruitment.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="sngce"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Reg No (CIN / LLPIN)
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  placeholder="CIN-U72200KA2018PTC112345"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Domain</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Bengaluru"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Recruiter Contact Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Daniel Thomas"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="recruiter@techcorp.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Registering Corporate Account...' : 'Complete Recruiter Onboarding'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
