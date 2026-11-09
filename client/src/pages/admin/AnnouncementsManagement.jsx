import React, { useState, useEffect } from 'react';
import { Megaphone, PlusCircle, Pin, Eye, Calendar } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    targetAudience: ['all'],
    isPinned: false,
  });

  const { showToast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/communications/announcements');
      setAnnouncements(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', formData);
      showToast('Announcement published successfully!', 'success');
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        priority: 'Medium',
        targetAudience: ['all'],
        isPinned: false,
      });
      fetchAnnouncements();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Campus Circulars & Announcements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast urgent notices, circulars, and departmental updates across student and faculty portals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Publish Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann._id}
            className={`bg-white p-5 rounded-2xl border transition-all ${
              ann.isPinned ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {ann.isPinned && <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600 shrink-0" />}
                <h3 className="font-heading font-bold text-sm text-slate-900">{ann.title}</h3>
              </div>
              <Badge
                variant={ann.priority === 'Urgent' ? 'danger' : ann.priority === 'High' ? 'warning' : 'neutral'}
                size="sm"
              >
                {ann.priority}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">{ann.content}</p>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>By: {ann.author?.name || 'Administrator'}</span>
                <span>•</span>
                <span>Audience: {ann.targetAudience?.join(', ')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish New Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule for External Project Viva & Evaluations"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Circular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.targetAudience[0]}
                onChange={(e) => setFormData((p) => ({ ...p, targetAudience: [e.target.value] }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Entire Campus (All Users)</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Content</label>
            <textarea
              rows="4"
              required
              placeholder="Full text of the circular, guidelines, and compliance instructions..."
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData((p) => ({ ...p, isPinned: e.target.checked }))}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPinned" className="text-xs font-medium text-slate-700">
              Pin to top of campus notice board
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Publish Circular
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
