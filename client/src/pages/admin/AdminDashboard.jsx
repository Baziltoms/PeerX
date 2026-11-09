import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building,
  Megaphone,
  Calendar,
  Clock,
  AlertTriangle,
  PlusCircle,
  FileDown,
  ArrowUpRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // HOD Management states
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, dept: null, faculty: null });
  const [assigning, setAssigning] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, deptRes, facRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/departments'),
        api.get('/admin/faculty'),
      ]);
      setData(statsRes.data);
      setDepartments(deptRes.data || []);
      setFacultyList(facRes.data || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectFaculty = (deptId, facultyUserId) => {
    setSelectedFaculty((prev) => ({ ...prev, [deptId]: facultyUserId }));
  };

  const handleInitiateAssign = (dept) => {
    const facultyUserId = selectedFaculty[dept._id];
    if (!facultyUserId) {
      showToast('Please select a faculty member from the dropdown first.', 'warning');
      return;
    }

    const facObj = facultyList.find((f) => (f.user?._id || f._id) === facultyUserId);
    if (!facObj) return;

    // Show confirmation if HOD is already assigned or being changed
    if (dept.hodUser || dept.hodName) {
      setConfirmModal({
        isOpen: true,
        dept,
        faculty: facObj,
      });
    } else {
      executeAssignHod(dept._id, facultyUserId, facObj.user?.name || facObj.name);
    }
  };

  const executeAssignHod = async (departmentId, facultyUserId, facultyName) => {
    setAssigning(true);
    try {
      const res = await api.post('/admin/assign-hod', { departmentId, facultyUserId });
      showToast(res.message || `'${facultyName}' successfully assigned as HOD.`, 'success');
      setConfirmModal({ isOpen: false, dept: null, faculty: null });
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to assign HOD', 'error');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingSkeleton count={4} />;

  const stats = data?.stats || {};
  const complaintSummary = stats.complaintSummary || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Glassmorphic Admin Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=4f46e5&color=fff`
                }
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">{user?.institution?.name || 'sngce'}</span>
                <span>•</span>
                <span className="font-mono text-white font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/admin/students"
              className="flex-1 md:flex-none px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" /> Provision User
            </Link>
            <Link
              to="/admin/announcements"
              className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Megaphone className="w-4 h-4 text-indigo-200" /> New Notice
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          subtitle="Enrolled Across Batches"
          icon={GraduationCap}
          color="indigo"
          trend="+12% this academic year"
          trendType="up"
        />
        <StatCard
          title="Active Faculty"
          value={stats.totalFaculty || 0}
          subtitle="Allocated to Departments"
          icon={Users}
          color="amber"
          trend="100% Timetable Assigned"
          trendType="up"
        />
        <StatCard
          title="Academic Departments"
          value={stats.totalDepartments || 0}
          subtitle="Specialization Units"
          icon={Building}
          color="sky"
          trend="MCA & CS Divisions"
          trendType="up"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals || 0}
          subtitle="Events & Verifications"
          icon={Clock}
          color="rose"
          trend="Requires Action"
          trendType="down"
        />
      </div>

      {/* 3. Complaints Summary & Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Breakdown Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Department Enrollment & Faculty Distribution
            </h3>
            <Link to="/admin/departments" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              Manage Departments
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Department Name</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">HOD</th>
                  <th className="py-3 px-3 text-right">Students</th>
                  <th className="py-3 px-3 text-right">Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.departmentStats || []).map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-700 font-mono font-bold text-[11px] border border-slate-200/60">
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{dept.hodName || 'Assigned HOD'}</td>
                    <td className="py-3.5 px-3 text-right font-extrabold text-indigo-600 text-sm">{dept.students}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-700">{dept.faculty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Grievance Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover-lift">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Campus Grievances
              </h3>
              <Link to="/admin/complaints" className="text-xs text-indigo-600 font-bold hover:underline">
                View All
              </Link>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Student and staff grievances monitored under institutional compliance.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-600 font-semibold">Total Tickets</span>
                <span className="text-sm font-extrabold text-slate-900">{complaintSummary.total || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50/80 rounded-2xl text-amber-800 border border-amber-200/60">
                <span className="text-xs font-semibold">Pending Review</span>
                <span className="text-sm font-extrabold text-amber-900">{complaintSummary.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sky-50/80 rounded-2xl text-sky-800 border border-sky-200/60">
                <span className="text-xs font-semibold">In Progress</span>
                <span className="text-sm font-extrabold text-sky-900">{complaintSummary.inProgress || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50/80 rounded-2xl text-emerald-800 border border-emerald-200/60">
                <span className="text-xs font-semibold">Resolved</span>
                <span className="text-sm font-extrabold text-emerald-900">{complaintSummary.resolved || 0}</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/complaints"
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors block shadow-sm"
          >
            Review Urgent Tickets
          </Link>
        </div>
      </div>

      {/* 4. Recent Announcements & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" /> Active Campus Circulars
            </h3>
            <Link to="/admin/announcements" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recentAnnouncements || []).map((ann) => (
              <div key={ann._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{ann.title}</span>
                  <Badge variant={ann.priority === 'Urgent' ? 'danger' : ann.priority === 'High' ? 'warning' : 'neutral'} size="sm">
                    {ann.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{ann.content}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Audience: {ann.targetAudience?.join(', ')}</span>
                  <span>•</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> College Calendar & Events
            </h3>
            <Link to="/admin/events" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">
              View Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.nextEvents || []).map((ev) => (
              <div key={ev._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{ev.title}</span>
                    <Badge variant="sky" size="sm">{ev.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Venue: {ev.venue}</p>
                  <p className="text-[11px] text-indigo-600 font-bold mt-0.5">
                    {new Date(ev.startDate).toLocaleDateString()} — {new Date(ev.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. HOD Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover-lift">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> HOD Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assign and manage Head of Department (HOD) roles across academic departments. Only one active HOD is allowed per department.
            </p>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 px-3 py-1 rounded-full shrink-0">
            {departments.length} Departments Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const currentHodUser = dept.hodUser;
            const currentHodName = currentHodUser?.name || dept.hodName || 'Not Assigned';

            return (
              <div
                key={dept._id}
                className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-extrabold text-xs rounded-md">
                        {dept.code}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                        {dept.name}
                      </h4>
                    </div>
                  </div>

                  {/* Active HOD Card Indicator */}
                  <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {currentHodName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          Current Active HOD
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {currentHodName}
                        </span>
                        {currentHodUser?.email && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                            {currentHodUser.email}
                          </span>
                        )}
                      </div>
                    </div>
                    {dept.hodUser ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Pending</Badge>
                    )}
                  </div>
                </div>

                {/* Faculty Selection & Assign Button */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Assign Faculty as HOD:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedFaculty[dept._id] || ''}
                      onChange={(e) => handleSelectFaculty(dept._id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Select Faculty Member --</option>
                      {facultyList.map((f) => {
                        const facUserId = f.user?._id || f._id;
                        const facName = f.user?.name || f.name;
                        const isCurrentHod = (dept.hodUser?._id || dept.hodUser) === facUserId;
                        return (
                          <option key={facUserId} value={facUserId}>
                            {facName} ({f.employeeId || f.designation || 'Faculty'}) {isCurrentHod ? '★ (Current HOD)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() => handleInitiateAssign(dept)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> {dept.hodUser ? 'Change HOD' : 'Assign HOD'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOD Assignment Confirmation Modal */}
      {confirmModal.isOpen && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, dept: null, faculty: null })}
          title="Confirm HOD Reassignment"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
              <p className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Reassign Department HOD
              </p>
              <p className="leading-relaxed">
                Assigning <strong>{confirmModal.faculty?.user?.name || confirmModal.faculty?.name}</strong> will revoke HOD access permissions from the currently assigned HOD (<strong>{confirmModal.dept?.hodUser?.name || confirmModal.dept?.hodName || 'Current HOD'}</strong>) for <strong>{confirmModal.dept?.name}</strong>.
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Only one active HOD is allowed for each department. The new HOD will immediately receive Timetable Management permissions. Do you wish to continue?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, dept: null, faculty: null })}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assigning}
                onClick={() =>
                  executeAssignHod(
                    confirmModal.dept._id,
                    selectedFaculty[confirmModal.dept._id],
                    confirmModal.faculty?.user?.name || confirmModal.faculty?.name
                  )
                }
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                {assigning ? 'Updating HOD...' : 'Confirm HOD Change'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

