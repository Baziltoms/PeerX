import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Save,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const FacultyAttendance = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [assignedData, setAssignedData] = useState({ subjects: [], classSections: [] });
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classSectionId') || '');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subjectId') || '');
  const [periodNumber, setPeriodNumber] = useState(searchParams.get('periodNumber') || '1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicCovered, setTopicCovered] = useState('');

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { studentId: 'Present'|'Absent'|'Late'|'Excused' }
  const [existingSession, setExistingSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // 1. Fetch faculty's assigned classes & subjects
  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await api.get('/faculty/assigned-classes');
        setAssignedData(res.data);

        if (!selectedClass && res.data.classSections?.length > 0) {
          setSelectedClass(res.data.classSections[0]._id);
        }
        if (!selectedSubject && res.data.subjects?.length > 0) {
          setSelectedSubject(res.data.subjects[0]._id);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  // 2. Fetch student roster when class changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      try {
        const res = await api.get(
          `/faculty/attendance/students?classSectionId=${selectedClass}&subjectId=${selectedSubject}&periodNumber=${periodNumber}&date=${date}`
        );
        const studentList = res.data.students || [];
        setStudents(studentList);
        setExistingSession(res.data.existingSession);

        // Populate initial attendance state
        const initialMap = {};
        studentList.forEach((s) => {
          initialMap[s.studentId] = s.currentStatus || 'Present';
        });
        setRecords(initialMap);
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSubject, periodNumber, date]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSelectAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s.studentId] = 'Present';
    });
    setRecords(updated);
    showToast('All students marked Present', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const attendanceRecords = Object.entries(records).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await api.post('/faculty/attendance/submit', {
        classSectionId: selectedClass,
        subjectId: selectedSubject,
        periodNumber: Number(periodNumber),
        date,
        attendanceRecords,
        topicCovered,
      });

      showToast('Attendance recorded and synchronized successfully!', 'success');
      // Refresh session
      const res = await api.get(
        `/faculty/attendance/students?classSectionId=${selectedClass}&subjectId=${selectedSubject}&periodNumber=${periodNumber}&date=${date}`
      );
      setExistingSession(res.data.existingSession);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-heading font-bold text-slate-900">Period Attendance Marker</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Mark period-by-period class attendance with 24-hour edit windows
        </p>
      </div>

      {/* Filter & Period Selection Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            {assignedData.classSections?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} (Semester {c.semester})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            {assignedData.subjects?.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Period Number</label>
          <select
            value={periodNumber}
            onChange={(e) => setPeriodNumber(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
              <option key={p} value={p}>
                Period {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Session Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Roster & Attendance Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Student Attendance Roster ({students.length} Students)
            </h3>
            {existingSession && (
              <Badge variant="success" size="sm">Session Recorded</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllPresent}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Select All Present
            </button>
            <input
              type="text"
              placeholder="Search by student name or roll..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 w-48 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Student Cards Roster */}
        <div className="divide-y divide-slate-100">
          {filteredStudents.map((st) => {
            const currentStatus = records[st.studentId] || 'Present';

            return (
              <div
                key={st.studentId}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {st.rollNumber}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{st.name}</div>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5">
                  {['Present', 'Absent', 'Late', 'Excused'].map((stat) => {
                    const isSelected = currentStatus === stat;
                    return (
                      <button
                        key={stat}
                        type="button"
                        onClick={() => handleStatusChange(st.studentId, stat)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? stat === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : stat === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : stat === 'Late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {stat}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Topic Covered & Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Lecture topic covered (e.g. Express Route Middleware & JWT Validation)"
              value={topicCovered}
              onChange={(e) => setTopicCovered(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Attendance...' : 'Save & Synchronize Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};
