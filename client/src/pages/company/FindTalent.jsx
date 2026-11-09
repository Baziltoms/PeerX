import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  CheckCircle2,
  Lock,
  ExternalLink,
  Info,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const FindTalent = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disclaimer, setDisclaimer] = useState('Match Score — not a hiring guarantee.');

  // Search Filters
  const [skills, setSkills] = useState('React.js, Node.js');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [course, setCourse] = useState('MCA');

  const { showToast } = useToast();

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/company/candidates/search?skills=${encodeURIComponent(skills)}&minCgpa=${minCgpa}&maxBacklogs=${maxBacklogs}&course=${course}`
      );
      setCandidates(res.data || []);
      if (res.disclaimer) setDisclaimer(res.disclaimer);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleShortlist = async (studentUserId) => {
    try {
      await api.post('/company/shortlist', { studentUserId, status: 'Shortlisted' });
      showToast('Candidate shortlisted in your recruitment pipeline!', 'success');
      fetchCandidates();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-heading font-bold text-slate-900">Campus Talent Discovery</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Match and evaluate verified student engineers using multi-attribute filters and explainable skill scoring
        </p>
      </div>

      {/* Filter Builder Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Talent Requirement Criteria
          </span>
          <button
            onClick={fetchCandidates}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Run Match Algorithm
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills</label>
            <input
              type="text"
              placeholder="e.g. React.js, Node.js, Python"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Degree / Course</label>
            <input
              type="text"
              placeholder="MCA"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA</label>
            <input
              type="number"
              step="0.1"
              min="5.0"
              max="10.0"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Backlogs Allowed</label>
            <input
              type="number"
              min="0"
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Explainable Match Score Algorithm Disclaimer Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Explainable Match Score Breakdown:</strong> Required Skills (40%) + Preferred Skills (20%) +
            Academics/CGPA (20%) + Projects (10%) + Course Fit (10%).{' '}
            <span className="font-bold text-indigo-600">{disclaimer}</span>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400 font-medium">
          No eligible candidates match the selected criteria. Try adjusting the skill requirements or lowering the CGPA cutoff.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {candidates.map((cand) => (
            <div
              key={cand._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all space-y-4"
            >
              <div>
                {/* Candidate Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={cand.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name || 'S')}&background=4f46e5&color=fff`}
                      alt=""
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-900">{cand.name}</h3>
                      <p className="text-xs text-slate-500">{cand.institution} • {cand.course}</p>
                    </div>
                  </div>

                  {/* Calculated Match Score Tag */}
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold shadow-sm">
                      {cand.matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Academic Metrics Row */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-2xl text-center text-xs mt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">CGPA</span>
                    <strong className="text-slate-800">{cand.cgpa?.toFixed(2) || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Semester</span>
                    <strong className="text-slate-800">Sem {cand.semester}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Graduation</span>
                    <strong className="text-slate-800">{cand.graduationYear}</strong>
                  </div>
                </div>

                {/* Verified Skills */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Technical Proficiencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(cand.skills || []).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                      >
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Privacy-Protected Contact Status */}
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Student Contact Details:</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    {cand.contactEmail.includes('Hidden') && <Lock className="w-3 h-3 text-slate-400" />}
                    {cand.contactEmail}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/company/candidates/${cand.userId}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Inspect Candidate Profile →
                </Link>

                {cand.shortlistStatus ? (
                  <Badge variant="sky">Stage: {cand.shortlistStatus}</Badge>
                ) : (
                  <button
                    onClick={() => handleShortlist(cand.userId)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Shortlist Candidate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
