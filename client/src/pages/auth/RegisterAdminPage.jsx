import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, ShieldCheck, Mail, Lock, User, Globe, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const RegisterAdminPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeName: '',
    collegeCode: '',
    universityCollegeId: '',
    website: '',
    phone: '',
    city: '',
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
      const res = await api.post('/auth/register-admin', formData);
      const { token, user } = res.data;
      localStorage.setItem('peerx_token', token);
      localStorage.setItem('peerx_user', JSON.stringify(user));
      setUser(user);
      showToast('Institution registered & Administrator account created!', 'success');
      navigate('/admin/dashboard');
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
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-900">
                Register College Institution
              </h2>
              <p className="text-xs text-slate-500">
                College Administrator onboarding with official University verification ID
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>One Administrator per Institution Policy:</strong> Each university-issued
                Institution ID (e.g. AIT-UNIV-101) can only be registered once.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College / University Name</label>
                <input
                  type="text"
                  name="collegeName"
                  required
                  placeholder="sngce"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Code (Abbr)</label>
                <input
                  type="text"
                  name="collegeCode"
                  required
                  placeholder="AIT"
                  value={formData.collegeCode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University Verification ID
                </label>
                <input
                  type="text"
                  name="universityCollegeId"
                  required
                  placeholder="AIT-UNIV-101"
                  value={formData.universityCollegeId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus City / Location</label>
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
                Administrator Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Dr. Gino Peter"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="dean@sngce.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Secure Password</label>
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
              {loading ? 'Verifying & Registering...' : 'Complete College Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
