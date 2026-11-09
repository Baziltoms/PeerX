import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Mail,
  Phone,
  Lock,
  Unlock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const CandidateDetail = () => {
  const { studentUserId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState('Shortlisted');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const fetchCandidate = async () => {
    try {
      const res = await api.get(`/company/candidates/${studentUserId}`);
      setData(res.data);
      if (res.data.shortlist) {
        setCurrentStage(res.data.shortlist.status);
        setNotes(res.data.shortlist.notes || '');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [studentUserId]);

  const handleUpdateStage = async (newStage) => {
    setUpdating(true);
    try {
      await api.post('/company/shortlist', {
        studentUserId,
        status: newStage,
        notes,
      });
      setCurrentStage(newStage);
      showToast(`Candidate stage moved to '${newStage}'!`, 'success');
      await fetchCandidate();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const profile = data?.profile || {};
  const user = profile.user || {};
  const achievements = data?.achievements || [];
  const contactEmail = data?.contactEmail || '';
  const contactPhone = data?.contactPhone || '';
  const isUnlocked = !contactEmail.includes('Protected');

  const pipelineStages = ['Matched', 'Shortlisted', 'Screening', 'Interview', 'Selected', 'Rejected'];

  return (
    <div className="space-y-6">
      <Link
        to="/company/talent"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Candidate Search
      </Link>

      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'S')}&background=4f46e5&color=fff`}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-heading font-bold text-slate-900">{user.name}</h1>
              <Badge variant="primary">{profile.course || 'MCA'}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profile.institution?.name} • Semester {profile.semester} • Graduating {profile.graduationYear}
            </p>
          </div>
        </div>

        {/* Academic Highlights */}
        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CGPA</span>
            <span className="text-lg font-bold text-slate-900">{profile.cgpa?.toFixed(2) || '8.92'}</span>
          </div>
          <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Backlogs</span>
            <span className="text-lg font-bold text-emerald-600">{profile.backlogs || 0}</span>
          </div>
        </div>
      </div>

      {/* Recruitment Pipeline Stage Controller */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900">
          Recruitment Pipeline Stage Transition
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((st) => (
            <button
              key={st}
              onClick={() => handleUpdateStage(st)}
              disabled={updating}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                currentStage === st
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Privacy Unlocked Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
            isUnlocked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
            <div>
              <span className="font-bold">Contact Channel Status: </span>
              <span>{isUnlocked ? 'Candidate direct contact details unlocked!' : 'Move to Screening or Interview stage to unlock contact phone & email.'}</span>
            </div>
          </div>

          {isUnlocked && (
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-emerald-600" /> {contactEmail}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {contactPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Verified Peer Credentials */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm">
          <h3 className="font-heading font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" /> PeerX Verifiable Peer Skill Credentials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((ach) => (
              <div key={ach._id} className="p-3 bg-amber-50/40 rounded-2xl border border-amber-100 text-xs flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900">{ach.skillName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Hash: {ach.verificationCode}</p>
                </div>
                <span className="px-2.5 py-1 bg-white rounded-xl font-bold text-indigo-700 border border-amber-200">
                  {ach.scoreAchieved}% Score
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900">Engineering Projects Portfolio</h3>
        <div className="space-y-3">
          {(profile.projects || []).map((p, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className="font-bold text-xs text-slate-900">{p.title}</h4>
                <span className="text-[11px] font-mono text-indigo-600">{p.techStack?.join(' • ')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
