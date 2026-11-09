import React, { useState, useEffect } from 'react';
import { Briefcase, PlusCircle, Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const OpportunitiesManagement = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posting, setPosting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Full-time',
    workMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    salaryOrStipend: '₹8 - ₹12 LPA',
    minCgpa: 7.5,
    eligibleCourses: 'MCA, B.Tech CS',
    requiredSkills: 'React.js, Node.js, MongoDB',
    deadline: '',
    vacancies: 5,
  });

  const { showToast } = useToast();

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/company/opportunities');
      setOpportunities(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setPosting(true);

    try {
      await api.post('/company/opportunities', {
        ...formData,
        eligibleCourses: formData.eligibleCourses.split(',').map((c) => c.trim()),
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()),
      });
      showToast('Opportunity published to student portals successfully!', 'success');
      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Campus Job & Internship Postings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish recruitment drives, eligibility rules, and compensation packages directly to students
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Post New Opening
        </button>
      </div>

      <div className="space-y-4">
        {opportunities.map((opp) => (
          <div key={opp._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="primary">{opp.type}</Badge>
                  <Badge variant="neutral">{opp.workMode}</Badge>
                  <span className="text-xs text-slate-400">• Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900">{opp.title}</h3>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-slate-900 block">{opp.salaryOrStipend}</span>
                <span className="text-[11px] text-slate-400">Min CGPA: {opp.minCgpa}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{opp.description}</p>

            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Required Skills:</span>
              {(opp.requiredSkills || []).map((sk, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-slate-100 rounded-lg text-xs text-slate-700 font-medium">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Recruitment Opening">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Associate Software Development Engineer (Full Stack)"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Full-time">Full-time (Graduate SDE)</option>
                <option value="Internship">Internship (Pre-Placement)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData((p) => ({ ...p, workMode: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site Campus</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary / Stipend</label>
              <input
                type="text"
                placeholder="₹9 - ₹12 LPA or ₹35,000 / mo"
                value={formData.salaryOrStipend}
                onChange={(e) => setFormData((p) => ({ ...p, salaryOrStipend: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                value={formData.minCgpa}
                onChange={(e) => setFormData((p) => ({ ...p, minCgpa: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
              <input
                type="text"
                value={formData.requiredSkills}
                onChange={(e) => setFormData((p) => ({ ...p, requiredSkills: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description & Responsibilities</label>
            <textarea
              rows="3"
              required
              placeholder="Candidate responsibilities, team structure, tech stack..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            ></textarea>
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
              disabled={posting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {posting ? 'Publishing...' : 'Publish Opening'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
