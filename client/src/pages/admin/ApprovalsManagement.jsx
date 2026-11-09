import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const ApprovalsManagement = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/admin/approvals');
      setApprovals(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleReview = async (approvalId, status) => {
    try {
      const res = await api.patch(`/admin/approvals/${approvalId}`, { status });
      showToast(res.message, 'success');
      fetchApprovals();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-heading font-bold text-slate-900">Institutional Approvals Queue</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review and authorize pending faculty leave requests, student event permits, and verification submissions
        </p>
      </div>

      <div className="space-y-3">
        {approvals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium">
            No approval requests currently in queue.
          </div>
        ) : (
          approvals.map((app) => (
            <div
              key={app._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'danger' : 'warning'}>
                    {app.status}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-700">[{app.type}]</span>
                  <span className="text-[11px] text-slate-400">• Requested by {app.requestedBy?.name || 'Staff Member'}</span>
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{app.title}</h3>
                <p className="text-xs text-slate-500">{app.details || 'Standard verification request.'}</p>
              </div>

              {app.status === 'Pending' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReview(app._id, 'Approved')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReview(app._id, 'Rejected')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
