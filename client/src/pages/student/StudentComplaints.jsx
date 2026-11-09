import React, { useState, useEffect } from 'react';
import { AlertTriangle, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
    isAnonymous: false,
  });

  const { showToast } = useToast();

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/students/complaints');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/students/complaints', formData);
      showToast('Grievance ticket submitted securely.', 'success');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'Academic', isAnonymous: false });
      fetchComplaints();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Campus Grievances & Support</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit academic, infrastructural, or hostel concerns directly to the institutional grievance redressal committee
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Submit Grievance Ticket
        </button>
      </div>

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No grievance tickets submitted. If you encounter any academic or facility issues, you can submit a ticket above.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'Resolved' ? 'success' : c.status === 'In Progress' ? 'sky' : 'warning'}>
                    {c.status}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">[{c.category}]</span>
                  {c.isAnonymous && <span className="text-[10px] text-slate-400 italic font-mono">(Anonymous)</span>}
                </div>
                <span className="text-[11px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{c.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{c.description}</p>

              {c.resolutionNotes && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                  <strong>Administrative Action / Resolution:</strong> {c.resolutionNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Grievance Ticket">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Issue Summary</label>
            <input
              type="text"
              required
              placeholder="e.g. Software Lab 3 Projector Hardware Malfunction"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Academic">Academic Curriculum</option>
              <option value="Infrastructure">Infrastructure & Lab Facilities</option>
              <option value="Examination">Examination & Evaluation</option>
              <option value="Hostel">Hostel & Food Amenities</option>
              <option value="Harassment">Anti-Harassment & Safety</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows="4"
              required
              placeholder="Explain the specific issue, room location, dates encountered..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData((p) => ({ ...p, isAnonymous: e.target.checked }))}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isAnonymous" className="text-xs text-slate-700">
              Submit anonymously (your name will not be displayed to reviewers)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
