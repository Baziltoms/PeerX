import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Building2,
  Filter,
  Search,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const CompanyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/company/dashboard-stats');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load company stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton count={3} />;

  const stats = data?.stats || {};
  const pipeline = stats.pipelineSummary || {};
  const recentShortlists = data?.recentShortlists || [];
  const profile = user?.profile || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Glassmorphic Recruiter Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Recruiter')}&background=0284c7&color=fff`
                }
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                  {profile.companyName || 'sngce'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                  Verified Recruiter
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1 flex flex-wrap items-center gap-2 font-medium">
                <span>Contact: <strong className="text-white">{user?.name}</strong></span>
                <span>•</span>
                <span className="font-mono text-white font-bold">{profile.registrationNumber || 'CIN-U72200KA2018PTC112345'}</span>
                <span>•</span>
                <span>{profile.industry || 'Software & Tech'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/company/talent"
              className="flex-1 md:flex-none px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4 text-indigo-600" /> Discover Talent
            </Link>
            <Link
              to="/company/opportunities"
              className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Briefcase className="w-4 h-4 text-indigo-200" /> Post Opening
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Eligible Candidates"
          value={stats.eligibleStudentsCount || 0}
          subtitle="Opted In for Placement"
          icon={Users}
          color="indigo"
          trend="Verified Tech Graduates"
          trendType="up"
        />
        <StatCard
          title="Shortlisted Talent"
          value={stats.totalShortlisted || 0}
          subtitle="Under Active Evaluation"
          icon={Filter}
          color="emerald"
          trend="High Match Score Rate"
          trendType="up"
        />
        <StatCard
          title="Active Openings"
          value={stats.activeOpportunities || 0}
          subtitle="Campus Jobs & Internships"
          icon={Briefcase}
          color="amber"
          trend="Live Job Listings"
          trendType="up"
        />
        <StatCard
          title="Partner Institutions"
          value={stats.institutionsCount || 0}
          subtitle="Accredited Colleges"
          icon={Building2}
          color="sky"
          trend="sngce Institute Network"
          trendType="up"
        />
      </div>

      {/* 3. Recruitment Funnel Pipeline Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">Recruitment Pipeline Stages</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking candidate transitions from algorithm match to selection</p>
          </div>
          <Link to="/company/pipeline" className="text-xs text-indigo-600 font-bold hover:underline">
            View Full Pipeline
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { stage: 'Matched', count: pipeline.Matched || 0, color: 'border-slate-200 bg-slate-50/80 text-slate-800' },
            { stage: 'Shortlisted', count: pipeline.Shortlisted || 0, color: 'border-indigo-200/60 bg-indigo-50/80 text-indigo-900' },
            { stage: 'Screening', count: pipeline.Screening || 0, color: 'border-sky-200/60 bg-sky-50/80 text-sky-900' },
            { stage: 'Interview', count: pipeline.Interview || 0, color: 'border-amber-200/60 bg-amber-50/80 text-amber-900' },
            { stage: 'Selected', count: pipeline.Selected || 0, color: 'border-emerald-200/60 bg-emerald-50/80 text-emerald-900' },
            { stage: 'Rejected', count: pipeline.Rejected || 0, color: 'border-rose-200/60 bg-rose-50/80 text-rose-900' },
          ].map((s) => (
            <div key={s.stage} className={`p-4 rounded-2xl border ${s.color} text-center shadow-2xs hover:scale-[1.02] transition-transform`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-1">{s.stage}</span>
              <span className="text-2xl font-extrabold">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Shortlisted Candidates */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-sm text-slate-900">Recent Candidate Evaluations</h3>
          <Link to="/company/talent" className="text-xs text-indigo-600 font-bold hover:underline">
            Search More Candidates
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentShortlists.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No candidates shortlisted yet. Use Find Campus Talent to evaluate candidates with our Match Score algorithm.
            </div>
          ) : (
            recentShortlists.map((sl) => (
              <div key={sl._id} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src={sl.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sl.student?.name || 'S')}&background=4f46e5&color=fff`}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{sl.student?.name}</div>
                    <span className="text-[11px] text-slate-500">Status: <strong className="text-indigo-600 font-semibold">{sl.status}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-extrabold shadow-2xs">
                    Match Score: {sl.matchScore || 90}%
                  </span>
                  <Link
                    to={`/company/candidates/${sl.student?._id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

