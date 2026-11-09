import React, { useState, useEffect } from 'react';
import { ClipboardList, PlusCircle, Users, CheckCircle2, Award } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const FacultyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [assignedData, setAssignedData] = useState({ subjects: [], classSections: [] });
  const [loading, setLoading] = useState(true);

  // Create Assignment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    classSectionId: '',
    title: '',
    description: '',
    instructions: '',
    deadline: '',
    maxMarks: 50,
  });

  // Submissions Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [marksAwarded, setMarksAwarded] = useState(45);
  const [feedback, setFeedback] = useState('Excellent structure and test coverage.');

  const { showToast } = useToast();

  const fetchAssignments = async () => {
    try {
      const [assignRes, assignedRes] = await Promise.all([
        api.get('/faculty/assignments'),
        api.get('/faculty/assigned-classes'),
      ]);
      setAssignments(assignRes.data || []);
      setAssignedData(assignedRes.data);

      if (assignedRes.data.subjects?.length > 0 && !formData.subjectId) {
        setFormData((p) => ({
          ...p,
          subjectId: assignedRes.data.subjects[0]._id,
          classSectionId: assignedRes.data.classSections[0]?._id || '',
        }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faculty/assignments', formData);
      showToast('Assignment created successfully!', 'success');
      setIsModalOpen(false);
      setFormData((p) => ({
        ...p,
        title: '',
        description: '',
        instructions: '',
      }));
      fetchAssignments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    try {
      const res = await api.get(`/faculty/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/faculty/submissions/${gradingSubmission._id}/grade`, {
        marksAwarded,
        feedback,
      });
      showToast('Submission graded successfully!', 'success');
      setGradingSubmission(null);
      handleViewSubmissions(selectedAssignment);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Course Assignments & Grading</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create coursework tasks, verify submissions, and grade student laboratory deliverables
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((a) => (
          <div key={a._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {a.subject?.code}
                </span>
                <span className="text-xs font-semibold text-slate-700">{a.classSection?.name}</span>
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{a.title}</h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mb-2">{a.description}</p>
              <p className="text-xs text-slate-400">
                Deadline: <strong>{new Date(a.deadline).toLocaleDateString()}</strong> • Max Marks: {a.maxMarks}
              </p>
            </div>

            <button
              onClick={() => handleViewSubmissions(a)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" /> Review Submissions
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assignment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData((p) => ({ ...p, subjectId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                {assignedData.subjects?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section</label>
              <select
                value={formData.classSectionId}
                onChange={(e) => setFormData((p) => ({ ...p, classSectionId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                {assignedData.classSections?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} (Semester {c.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Full-Stack Role Guard Middleware & Mongoose Schemas"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Deadline</label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                value={formData.maxMarks}
                onChange={(e) => setFormData((p) => ({ ...p, maxMarks: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Description</label>
            <textarea
              rows="3"
              required
              placeholder="Task details and expectations..."
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* View Submissions Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submissions: ${selectedAssignment.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No student submissions recorded yet.</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub._id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{sub.student?.name}</div>
                      <p className="text-xs text-slate-600 mt-0.5">{sub.submissionText}</p>
                      {sub.fileUrl && (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline font-mono mt-1 block truncate"
                        >
                          {sub.fileUrl}
                        </a>
                      )}
                      {sub.status === 'graded' && (
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                          Graded: {sub.marksAwarded} / {selectedAssignment.maxMarks}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setGradingSubmission(sub)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold shrink-0"
                    >
                      {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Grade Submission Modal */}
      {gradingSubmission && (
        <Modal
          isOpen={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          title={`Grade Submission: ${gradingSubmission.student?.name}`}
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Awarded</label>
              <input
                type="number"
                min="0"
                max={selectedAssignment?.maxMarks || 100}
                value={marksAwarded}
                onChange={(e) => setMarksAwarded(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Feedback</label>
              <textarea
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Save Grade
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
