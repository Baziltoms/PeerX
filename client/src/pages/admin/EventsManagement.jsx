import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, MapPin, Clock } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
    startDate: '',
    endDate: '',
    venue: '',
  });

  const { showToast } = useToast();

  const fetchEvents = async () => {
    try {
      const res = await api.get('/communications/events');
      setEvents(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/events', formData);
      showToast('Campus event scheduled successfully!', 'success');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Academic',
        startDate: '',
        endDate: '',
        venue: '',
      });
      fetchEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">College Calendar & Events</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate campus workshops, hackathons, academic seminars, and cultural festivals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <div key={ev._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="sky" size="sm">{ev.category}</Badge>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(ev.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="font-heading font-bold text-sm text-slate-900 mb-1.5">{ev.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">{ev.description || 'No detailed description.'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-medium truncate">{ev.venue}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Campus Event">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. sngce National Hackathon 2026"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Academic">Academic Seminar</option>
                <option value="Workshop">Workshop / Hackathon</option>
                <option value="Placement">Placement & Industry Drive</option>
                <option value="Cultural">Cultural Festival</option>
                <option value="Sports">Sports Meet</option>
                <option value="Holiday">College Holiday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Auditorium</label>
              <input
                type="text"
                required
                placeholder="Main Auditorium & Lab Block"
                value={formData.venue}
                onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="Event goals, agenda, participating teams..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Add to Calendar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
