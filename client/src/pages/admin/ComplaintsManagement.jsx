import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { showToast } = useToast();

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints');
      setComplaints(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/complaints/${selectedComplaint._id}`, {
        status,
        resolutionNotes,
      });
      showToast('Grievance ticket updated!', 'success');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-heading font-bold text-slate-900">Campus Grievance & Complaints</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review, assign, and resolve student and staff institutional grievances with resolution audits
        </p>
      </div>

      <div className="space-y-3">
        {complaints.map((c) => (
          <div key={c._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant={c.status === 'Resolved' ? 'success' : c.status === 'In Progress' ? 'sky' : 'warning'}>
                  {c.status}
                </Badge>
                <span className="text-xs font-semibold text-slate-500">[{c.category}]</span>
                <span className="text-[11px] text-slate-400">• {new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{c.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{c.description}</p>
              {c.resolutionNotes && (
                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                  <strong>Resolution:</strong> {c.resolutionNotes}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedComplaint(c);
                setStatus(c.status);
                setResolutionNotes(c.resolutionNotes || '');
              }}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              Update Ticket
            </button>
          </div>
        ))}
      </div>

      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Update Grievance: ${selectedComplaint.title}`}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Pending">Pending Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved & Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution & Action Notes</label>
              <textarea
                rows="4"
                placeholder="Document remedial steps taken by department or facilities staff..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Ticket Update
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
