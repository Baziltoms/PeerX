import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Users, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const RecruitmentPipeline = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchShortlist = async () => {
    try {
      const res = await api.get('/company/shortlist');
      setCandidates(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlist();
  }, []);

  const handleAdvance = async (shortlistId, nextStage) => {
    try {
      await api.patch(`/company/shortlist/${shortlistId}/status`, { status: nextStage });
      showToast(`Candidate transitioned to ${nextStage}`, 'success');
      fetchShortlist();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const stages = ['Shortlisted', 'Screening', 'Interview', 'Selected'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-heading font-bold text-slate-900">Candidate Recruitment Pipeline</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kanban pipeline tracking student candidates through technical screening, live interviews, and final placement offers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {stages.map((st) => {
          const stageCandidates = candidates.filter((c) => c.status === st);

          return (
            <div key={st} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800">
                  {st}
                </h3>
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-3">
                {stageCandidates.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No candidates in this stage.</p>
                ) : (
                  stageCandidates.map((cand) => (
                    <div
                      key={cand._id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={cand.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.student?.name || 'S')}&background=4f46e5&color=fff`}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{cand.student?.name}</h4>
                          <span className="text-[10px] text-slate-400">{cand.profile?.course || 'MCA'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>CGPA: <strong>{cand.profile?.cgpa?.toFixed(2) || '8.92'}</strong></span>
                        <span className="font-semibold text-emerald-600">Match: {cand.matchScore || 90}%</span>
                      </div>

                      {/* Contact Status */}
                      <div className="text-[10px] text-slate-400 truncate">
                        Contact: <strong className="text-slate-700">{cand.contactEmail}</strong>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                        <Link
                          to={`/company/candidates/${cand.student?._id}`}
                          className="text-[11px] text-indigo-600 font-bold hover:underline"
                        >
                          Profile →
                        </Link>

                        {st === 'Shortlisted' && (
                          <button
                            onClick={() => handleAdvance(cand._id, 'Screening')}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold"
                          >
                            To Screening
                          </button>
                        )}
                        {st === 'Screening' && (
                          <button
                            onClick={() => handleAdvance(cand._id, 'Interview')}
                            className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold"
                          >
                            To Interview
                          </button>
                        )}
                        {st === 'Interview' && (
                          <button
                            onClick={() => handleAdvance(cand._id, 'Selected')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                          >
                            Select Candidate
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
