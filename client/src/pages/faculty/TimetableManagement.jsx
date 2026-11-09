import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building,
  User,
  BookOpen,
  Send,
  Layers,
  Sparkles,
  RefreshCw,
  UserCheck,
  UserPlus,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const TimetableManagement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    department: null,
    classSections: [],
    subjects: [],
    facultyMembers: [],
    timetableEntries: [],
    isHod: false,
    isFa: false,
    editableClassIds: [],
    roleMode: '',
  });

  const [selectedClassSection, setSelectedClassSection] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // FA Assignment modal state for HOD
  const [isFaModalOpen, setIsFaModalOpen] = useState(false);
  const [selectedFaFacultyId, setSelectedFaFacultyId] = useState('');
  const [assigningFa, setAssigningFa] = useState(false);

  // Form states for adding/editing entry
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    periodNumber: 1,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectId: '',
    facultyId: '',
    roomNumber: 'Lab Block 302',
    sessionType: 'Lecture',
  });

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faculty/hod/timetable');
      const resData = res.data || {};
      setData(resData);
      if (resData.classSections && resData.classSections.length > 0) {
        setSelectedClassSection((prev) => {
          const exists = resData.classSections.some((cs) => cs._id === prev);
          return exists ? prev : resData.classSections[0]._id;
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load timetable data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const defaultPeriods = [
    { period: 1, start: '09:00 AM', end: '09:50 AM' },
    { period: 2, start: '09:50 AM', end: '10:40 AM' },
    { period: 3, start: '10:50 AM', end: '11:40 AM' },
    { period: 4, start: '11:40 AM', end: '12:30 PM' },
    { period: 5, start: '01:15 PM', end: '02:05 PM' },
    { period: 6, start: '02:05 PM', end: '02:55 PM' },
    { period: 7, start: '03:05 PM', end: '03:55 PM' },
    { period: 8, start: '03:55 PM', end: '04:30 PM' },
  ];

  const currentClass = data.classSections.find((cs) => cs._id === selectedClassSection);
  const assignedFa = currentClass?.facultyAdvisor;
  const isHod = data.isHod;
  const canScheduleClass =
    data.editableClassIds?.includes(selectedClassSection) ||
    (assignedFa && (assignedFa._id || assignedFa) === user?._id);

  const handleOpenAssignFaModal = () => {
    setSelectedFaFacultyId(assignedFa?._id || assignedFa || data.facultyMembers[0]?._id || '');
    setIsFaModalOpen(true);
  };

  const handleAssignFa = async (e) => {
    e.preventDefault();
    if (!selectedFaFacultyId) {
      showToast('Please select a faculty member to assign as FA.', 'warning');
      return;
    }
    setAssigningFa(true);
    try {
      const res = await api.post('/faculty/hod/assign-fa', {
        classSectionId: selectedClassSection,
        facultyId: selectedFaFacultyId,
      });
      showToast(res.message || 'Faculty Advisor assigned successfully!', 'success');
      setIsFaModalOpen(false);
      fetchTimetableData();
    } catch (err) {
      showToast(err.message || 'Failed to assign Faculty Advisor.', 'error');
    } finally {
      setAssigningFa(false);
    }
  };

  const handleUnassignFa = async () => {
    if (!window.confirm(`Are you sure you want to unassign the Faculty Advisor from ${currentClass?.name}?`)) return;
    setAssigningFa(true);
    try {
      const res = await api.post('/faculty/hod/unassign-fa', {
        classSectionId: selectedClassSection,
      });
      showToast(res.message || 'Faculty Advisor unassigned.', 'success');
      setIsFaModalOpen(false);
      fetchTimetableData();
    } catch (err) {
      showToast(err.message || 'Failed to unassign Faculty Advisor.', 'error');
    } finally {
      setAssigningFa(false);
    }
  };

  const handleOpenAddModal = (day = 'Monday', period = 1, start = '09:00 AM', end = '10:00 AM', isBreak = false) => {
    if (!canScheduleClass) {
      showToast('Only the designated Faculty Advisor can schedule sessions for this class.', 'warning');
      return;
    }
    setEditingEntry(null);
    setErrorMessage('');
    setFormData({
      dayOfWeek: day,
      periodNumber: period,
      startTime: start,
      endTime: end,
      subjectId: data.subjects[0]?._id || '',
      facultyId: data.facultyMembers[0]?._id || '',
      roomNumber: currentClass?.roomNumber || 'Lab Block 302',
      sessionType: isBreak ? 'Break' : 'Lecture',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry) => {
    if (!canScheduleClass) {
      showToast('Only the designated Faculty Advisor can modify sessions for this class.', 'warning');
      return;
    }
    setEditingEntry(entry);
    setErrorMessage('');
    setFormData({
      dayOfWeek: entry.dayOfWeek,
      periodNumber: entry.periodNumber,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subject?._id || entry.subject || '',
      facultyId: entry.faculty?._id || entry.faculty || '',
      roomNumber: entry.roomNumber || currentClass?.roomNumber || 'Lab Block 302',
      sessionType: entry.sessionType || 'Lecture',
    });
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!selectedClassSection) {
      showToast('Please select a class section first.', 'warning');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        entryId: editingEntry?._id,
        classSectionId: selectedClassSection,
        dayOfWeek: formData.dayOfWeek,
        periodNumber: formData.periodNumber,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectId: formData.sessionType === 'Break' ? undefined : formData.subjectId,
        facultyId: formData.sessionType === 'Break' ? undefined : formData.facultyId,
        roomNumber: formData.roomNumber,
        sessionType: formData.sessionType,
      };

      const res = await api.post('/faculty/hod/timetable/save', payload);
      showToast(res.message || 'Timetable slot saved successfully!', 'success');
      setIsModalOpen(false);
      fetchTimetableData();
    } catch (err) {
      setErrorMessage(err.message);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!canScheduleClass) {
      showToast('Only the designated Faculty Advisor can delete sessions for this class.', 'warning');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this timetable slot?')) return;
    try {
      await api.delete(`/faculty/hod/timetable/entry/${entryId}`);
      showToast('Slot removed from timetable.', 'success');
      fetchTimetableData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePublishTimetable = async () => {
    if (!canScheduleClass) {
      showToast('Only the designated Faculty Advisor can publish this class timetable.', 'warning');
      return;
    }
    setPublishing(true);
    try {
      const res = await api.post('/faculty/hod/timetable/publish', {
        classSectionId: selectedClassSection,
      });
      showToast(res.message || 'Timetable published successfully to student portal!', 'success');
      fetchTimetableData();
    } catch (err) {
      showToast(err.message || 'Failed to publish timetable', 'error');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} />;

  const filteredEntries = data.timetableEntries.filter(
    (t) => (t.classSection?._id || t.classSection) === selectedClassSection
  );

  const isPublished = filteredEntries.length > 0 && filteredEntries.every((e) => e.isPublished);

  // Subject Workload Summary Calculation
  const subjectWorkload = data.subjects.map((sub) => {
    const assignedCount = filteredEntries.filter(
      (e) => (e.subject?._id || e.subject) === sub._id
    ).length;
    const requiredCount = sub.credits ? sub.credits * 1 : 4;
    return {
      _id: sub._id,
      name: sub.name,
      code: sub.code,
      type: sub.type,
      assigned: assignedCount,
      required: requiredCount,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                {isHod ? 'Department Timetable Overview & FA Allocation' : 'Faculty Advisor (FA) Timetable Scheduling'}
              </h1>
              {isHod ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/25 text-amber-100 border border-amber-300/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-300" /> HOD View Mode
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400/25 text-emerald-100 border border-emerald-300/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" /> Faculty Advisor (FA) Mode
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-100 mt-1.5 flex flex-wrap items-center gap-2 font-medium">
              <span>{data.department?.name || 'Department of Computer Applications'}</span>
              <span>•</span>
              <span className="font-mono font-bold">{data.department?.code || 'MCA'}</span>
              <span>•</span>
              <span>Logged as {isHod ? 'HOD' : 'Faculty Advisor'}: {user?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {canScheduleClass && (
              <button
                onClick={handlePublishTimetable}
                disabled={publishing || filteredEntries.length === 0}
                className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish Timetable'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Controls & Class Section Selector with FA Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Select Class Section:
            </label>
            <select
              value={selectedClassSection}
              onChange={(e) => setSelectedClassSection(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              {data.classSections.map((cs) => (
                <option key={cs._id} value={cs._id}>
                  {cs.name} (Semester {cs.semester}) — Room {cs.roomNumber}
                  {cs.facultyAdvisor ? ` [FA: ${cs.facultyAdvisor.name}]` : ' [No FA Assigned]'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Publication Status:</span>
              {isPublished ? (
                <Badge variant="success" size="sm">Published to Students</Badge>
              ) : (
                <Badge variant="warning" size="sm">Draft / Unpublished</Badge>
              )}
            </div>

            {canScheduleClass && (
              <button
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Period Slot
              </button>
            )}
          </div>
        </div>

        {/* Faculty Advisor Designation Card */}
        <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Designated Faculty Advisor (FA):
                </span>
                {assignedFa ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                    Assigned
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                    Unassigned
                  </span>
                )}
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                {assignedFa ? (
                  <span className="flex items-center gap-1.5">
                    {assignedFa.name} <span className="font-normal font-mono text-slate-400">({assignedFa.email})</span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">
                    No Faculty Advisor has been assigned to {currentClass?.name || 'this class'} yet.
                  </span>
                )}
              </div>
            </div>
          </div>

          {isHod && (
            <button
              onClick={handleOpenAssignFaModal}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {assignedFa ? 'Change Faculty Advisor' : 'Assign Faculty Advisor'}
            </button>
          )}
        </div>

        {/* Role Permissions Callout */}
        <div className="text-[11px] px-3.5 py-2.5 rounded-xl border flex items-center gap-2 font-medium bg-slate-100/60 dark:bg-slate-800/20 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          {canScheduleClass ? (
            <span>
              <strong>Faculty Advisor Scheduling Authorized:</strong> You are the designated FA for{' '}
              <strong>{currentClass?.name}</strong>. You have exclusive authority to allocate sessions, assign instructors, and publish the schedule.
            </span>
          ) : isHod ? (
            <span>
              <strong>HOD View Mode:</strong> You have department-wide oversight of all class schedules. Timetable slot scheduling for{' '}
              <strong>{currentClass?.name}</strong> is strictly managed by its assigned Faculty Advisor (
              {assignedFa ? <strong>{assignedFa.name}</strong> : 'Pending FA Assignment'}).
            </span>
          ) : (
            <span>
              <strong>View Mode:</strong> You are viewing the schedule for <strong>{currentClass?.name}</strong>. Timetable changes must be performed by the designated Faculty Advisor.
            </span>
          )}
        </div>
      </div>

      {/* 3. Subject Session Workload Requirement Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-heading font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Weekly Subject Required Sessions Tracker
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subjectWorkload.map((sw) => {
            const isComplete = sw.assigned >= sw.required;
            return (
              <div
                key={sw._id}
                className="p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
                    {sw.code} • {sw.type}
                  </span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate block max-w-[140px]">
                    {sw.name}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-extrabold text-xs px-2 py-0.5 rounded-lg font-mono ${
                      isComplete
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {sw.assigned} / {sw.required} sessions
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Timetable Weekly Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />{' '}
            {currentClass?.name ? `Weekly Timetable for ${currentClass.name}` : 'Weekly Timetable Grid'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {canScheduleClass
              ? "Click '+' on any time slot to allocate a period session"
              : 'Viewing mode (Managed by designated Faculty Advisor)'}
          </span>
        </div>

        <div className="space-y-6">
          {days.map((day) => {
            const dayEntries = filteredEntries.filter((e) => e.dayOfWeek === day);

            return (
              <div
                key={day}
                className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
              >
                <div className="bg-slate-100/80 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" /> {day}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                    {dayEntries.length} Sessions Scheduled
                  </span>
                </div>

                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {defaultPeriods.map((p) => {
                    const matchedEntry = dayEntries.find((e) => e.periodNumber === p.period);

                    if (p.isBreak) {
                      return (
                        <div
                          key={`${day}-break-${p.period}`}
                          className="p-3 bg-slate-100/60 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center flex flex-col justify-center items-center"
                        >
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                            RECESS / LUNCH BREAK
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
                            {p.start} - {p.end}
                          </span>
                        </div>
                      );
                    }

                    if (matchedEntry) {
                      const isBreakSession = matchedEntry.sessionType === 'Break';
                      return (
                        <div
                          key={matchedEntry._id}
                          className={`p-3.5 rounded-xl border transition-all relative group ${
                            isBreakSession
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                              : 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200/80 dark:border-indigo-500/30 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                              Period {matchedEntry.periodNumber}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {matchedEntry.startTime} - {matchedEntry.endTime}
                            </span>
                          </div>

                          {isBreakSession ? (
                            <div className="py-2 text-center text-xs font-bold text-slate-500">BREAK</div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                  {matchedEntry.subject?.name || 'Subject'}
                                </span>
                              </div>
                              <span className="inline-block text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded mb-1">
                                {matchedEntry.subject?.code} ({matchedEntry.sessionType || 'Lecture'})
                              </span>

                              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span className="truncate">{matchedEntry.faculty?.name || 'Assigned Faculty'}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                Room: {matchedEntry.roomNumber}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons for Authorized FA */}
                          {canScheduleClass && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(matchedEntry)}
                                className="p-1 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-slate-800 rounded transition-colors"
                                title="Edit Session"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(matchedEntry._id)}
                                className="p-1 text-rose-600 hover:bg-rose-100 dark:hover:bg-slate-800 rounded transition-colors"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Empty slot
                    if (canScheduleClass) {
                      return (
                        <div
                          key={`${day}-p${p.period}`}
                          onClick={() => handleOpenAddModal(day, p.period, p.start, p.end)}
                          className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-slate-800/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            Period {p.period} ({p.start} - {p.end})
                          </span>
                          <span className="text-xs font-bold flex items-center gap-1 mt-1">
                            <Plus className="w-3.5 h-3.5" /> Assign Session
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${day}-p${p.period}`}
                        className="p-4 border border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-xl text-center flex flex-col items-center justify-center gap-1 text-slate-300 dark:text-slate-600 select-none"
                      >
                        <span className="text-[10px] font-mono font-medium">
                          Period {p.period} ({p.start} - {p.end})
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">Unallocated Slot</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Add / Edit Timetable Session Modal (For FA) */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingEntry ? 'Edit Timetable Session Slot' : 'Add Weekly Timetable Session'}
        >
          <form onSubmit={handleSaveEntry} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Period Number
                </label>
                <select
                  value={formData.periodNumber}
                  onChange={(e) => setFormData({ ...formData, periodNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      Period {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  placeholder="e.g. 09:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Session Type
                </label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab Practical</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Break">Break</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="Hall 201"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {formData.sessionType !== 'Break' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {data.subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.code} — {sub.name} ({sub.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Member
                  </label>
                  <select
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {data.facultyMembers.map((fac) => (
                      <option key={fac._id} value={fac._id}>
                        {fac.name} ({fac.designation || 'Faculty'}) {fac.isFa ? '• FA' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {saving ? 'Validating Conflicts...' : editingEntry ? 'Update Session' : 'Save Session'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. Assign Faculty Advisor (FA) Modal (For HOD) */}
      {isFaModalOpen && (
        <Modal
          isOpen={isFaModalOpen}
          onClose={() => setIsFaModalOpen(false)}
          title={`Assign Faculty Advisor (FA) for ${currentClass?.name || 'Class'}`}
        >
          <form onSubmit={handleAssignFa} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              As Head of Department (HOD), assign a designated Faculty Advisor (FA) for{' '}
              <strong>{currentClass?.name}</strong>. The FA will be solely authorized to schedule and publish the weekly timetable for this class.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Faculty Member from Department:
              </label>
              <select
                value={selectedFaFacultyId}
                onChange={(e) => setSelectedFaFacultyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                required
              >
                <option value="">-- Choose Faculty Member --</option>
                {data.facultyMembers.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} — {fac.designation || 'Faculty'} ({fac.employeeId || 'ID'}) {fac.isFa ? '[Already an FA]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {assignedFa ? (
                <button
                  type="button"
                  onClick={handleUnassignFa}
                  disabled={assigningFa}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-colors"
                >
                  Unassign FA
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningFa}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {assigningFa ? 'Assigning...' : 'Confirm FA Assignment'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
