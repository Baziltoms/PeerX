import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  BookOpen,
  ClipboardList,
  Award,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

import { useSearchParams } from 'react-router-dom';

export const StudentAcademics = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'attendance';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [attendanceData, setAttendanceData] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [studentMeta, setStudentMeta] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);

  // Assignment submission modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchAcademics = async () => {
    try {
      const [attRes, ttRes, matRes, assignRes, resRes] = await Promise.all([
        api.get('/students/attendance'),
        api.get('/students/timetable'),
        api.get('/students/materials'),
        api.get('/students/assignments'),
        api.get('/students/results'),
      ]);

      setAttendanceData(attRes.data);
      setTimetable(ttRes.data || []);
      setStudentMeta(ttRes.profile || null);
      setMaterials(matRes.data || []);
      setAssignments(assignRes.data || []);
      setResults(resRes.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);

    try {
      await api.post(`/students/assignments/${selectedAssignment._id}/submit`, {
        submissionText,
        fileUrl: 'https://github.com/sngce/peerx-solution',
      });
      showToast('Assignment submitted successfully!', 'success');
      setSelectedAssignment(null);
      setSubmissionText('');
      fetchAcademics();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Academic Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Attendance monitoring, course syllabus, lecture materials, and assignment submissions
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto text-xs font-semibold">
          {[
            { key: 'attendance', label: 'Attendance', icon: Clock },
            { key: 'timetable', label: 'Timetable', icon: Calendar },
            { key: 'materials', label: 'Study Materials', icon: BookOpen },
            { key: 'assignments', label: 'Assignments', icon: ClipboardList },
            { key: 'results', label: 'Exam Results', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${isActive
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Attendance Grid & Subject Percentage */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Overall Attendance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-slate-900">{attendanceData?.overallPercentage || 0}%</h3>
                <span className="text-xs text-slate-500">
                  ({attendanceData?.totalPresent || 0} / {attendanceData?.totalClasses || 0} classes)
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  style={{ width: `${attendanceData?.overallPercentage || 0}%` }}
                  className={`h-full rounded-full ${(attendanceData?.overallPercentage || 0) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                ></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Classes Attended</span>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{attendanceData?.totalPresent || 0}</h3>
              <p className="text-xs text-slate-400 mt-1">Present & Authorized Late periods</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Classes Absent</span>
              <h3 className="text-3xl font-bold text-rose-600 mt-1">{attendanceData?.totalAbsent || 0}</h3>
              <p className="text-xs text-slate-400 mt-1">Unexcused recorded absences</p>
            </div>
          </div>

          {/* Subject Wise Breakdown Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-heading font-bold text-sm text-slate-900 mb-4">
              Per-Subject Attendance Metrics
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Subject Name & Code</th>
                    <th className="py-2.5 px-3 text-center">Total Sessions</th>
                    <th className="py-2.5 px-3 text-center">Present</th>
                    <th className="py-2.5 px-3 text-center">Absent</th>
                    <th className="py-2.5 px-3 text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(attendanceData?.subjectSummaries || []).map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{sub.subjectName}</div>
                        <div className="text-[11px] font-mono text-indigo-600">{sub.subjectCode}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{sub.total}</td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-600">{sub.present}</td>
                      <td className="py-3 px-3 text-center font-semibold text-rose-600">{sub.absent}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-lg ${sub.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                          {sub.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Period-by-Period Day Records */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-heading font-bold text-sm text-slate-900 mb-4">
              Recent Period-Level Attendance Log
            </h3>
            <div className="space-y-2.5">
              {(attendanceData?.recentRecords || []).map((rec) => (
                <div
                  key={rec._id}
                  className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-500">
                      {new Date(rec.date).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-slate-800">
                      Period {rec.periodNumber}: {rec.subject?.name}
                    </span>
                  </div>

                  <Badge
                    variant={
                      rec.status === 'Present'
                        ? 'success'
                        : rec.status === 'Late'
                          ? 'warning'
                          : rec.status === 'Excused'
                            ? 'sky'
                            : 'danger'
                    }
                    size="sm"
                  >
                    {rec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Timetable */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Published Weekly Timetable
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official weekly class timetable published by HOD for{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {studentMeta?.department?.name || 'Computer Applications'}
                  </strong>{' '}
                  (Semester {studentMeta?.semester || 4})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">HOD Published • Read Only</Badge>
              </div>
            </div>

            {/* Weekly Matrix Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 rounded-tl-xl w-32 border-r border-slate-200/60 dark:border-slate-800">Time / Period</th>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <th key={day} className="py-3.5 px-4 text-center border-r border-slate-200/60 dark:border-slate-800 last:border-r-0">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { period: 1, time: '09:00 - 09:50' },
                    { period: 2, time: '09:50 - 10:40' },
                    { period: 3, time: '10:50 - 11:40' },
                    { period: 4, time: '11:40 - 12:30' },
                    { period: 5, time: '01:15 - 02:05' },
                    { period: 6, time: '02:05 - 02:55' },
                    { period: 7, time: '03:05 - 03:55' },
                    { period: 8, time: '03:55 - 04:30' },
                  ].map((row) => (
                    <tr
                      key={row.period}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 border-r border-slate-200/60 dark:border-slate-800">
                        {row.time}
                      </td>

                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                        const match = timetable.find((t) => t.dayOfWeek === day && t.periodNumber === row.period);

                        if (!match) {
                          return (
                            <td key={day} className="py-3 px-3 text-center text-slate-300 dark:text-slate-600 font-mono text-[11px] border-r border-slate-200/60 dark:border-slate-800 last:border-r-0">
                              Free Period
                            </td>
                          );
                        }

                        if (match.sessionType === 'Break') {
                          return (
                            <td key={day} className="py-2.5 px-3 text-center bg-amber-50/30 dark:bg-amber-500/5 border-r border-slate-200/60 dark:border-slate-800 last:border-r-0">
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 tracking-wider font-mono">BREAK</span>
                            </td>
                          );
                        }

                        return (
                          <td key={day} className="py-3 px-3 border-r border-slate-200/60 dark:border-slate-800 last:border-r-0">
                            <div className="p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">
                                {match.subject?.code ? `${match.subject.code} - ` : ''}{match.subject?.name || 'Class Session'}
                              </span>
                              <span className="text-[11px] text-slate-600 dark:text-slate-300 block truncate font-medium mt-0.5">
                                {match.faculty?.name || 'Faculty'}
                              </span>
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-mono mt-0.5 font-bold">
                                {match.roomNumber ? `Room ${match.roomNumber}` : `[ ${match.sessionType || 'Theory'} ]`}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Study Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((m) => (
              <div key={m._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="sky" size="sm">{m.unitCategory}</Badge>
                    <span className="text-[11px] font-mono text-slate-400">{m.materialType}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{m.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{m.description || 'Reference materials and lecture notes.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{m.subject?.code}</span>
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((a) => (
              <div key={a._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {a.subject?.code}
                    </span>
                    <Badge variant={a.isSubmitted ? 'success' : 'warning'}>
                      {a.isSubmitted ? 'Submitted' : 'Pending Submission'}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{a.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2 max-w-2xl">{a.description}</p>
                  <p className="text-xs text-slate-400">
                    Deadline: <strong>{new Date(a.deadline).toLocaleDateString()}</strong> • Max Marks: {a.maxMarks}
                  </p>

                  {a.submission && a.submission.status === 'graded' && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                      <strong>Score:</strong> {a.submission.marksAwarded} / {a.maxMarks} • <strong>Faculty Feedback:</strong> {a.submission.feedback || 'Great work.'}
                    </div>
                  )}
                </div>

                {!a.isSubmitted ? (
                  <button
                    onClick={() => setSelectedAssignment(a)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Submit Solution
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Solution Recorded
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Exam Results */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-heading font-bold text-sm text-slate-900 mb-4">
            Internal Exam & Assessment Marks
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Assessment Type</th>
                  <th className="py-2.5 px-3 text-center">Max Marks</th>
                  <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                  <th className="py-2.5 px-3 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Mid-term and internal assessment marks will be published here following faculty evaluation.
                    </td>
                  </tr>
                ) : (
                  results.map((r) => (
                    <tr key={r._id}>
                      <td className="py-3 px-3 font-semibold text-slate-900">{r.subject?.name}</td>
                      <td className="py-3 px-3 text-slate-500">{r.exam?.name || 'Internal Assessment 1'}</td>
                      <td className="py-3 px-3 text-center font-semibold">{r.maxMarks}</td>
                      <td className="py-3 px-3 text-center font-bold text-indigo-600">{r.marksObtained}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit Assignment: ${selectedAssignment.title}`}
        >
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solution Notes / GitHub Repository Link / Explanation
              </label>
              <textarea
                rows="4"
                required
                placeholder="Paste your verified GitHub repository URL, architecture notes, or execution commands..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
