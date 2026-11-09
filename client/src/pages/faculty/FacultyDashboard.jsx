import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Calendar,
  ClipboardList,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/faculty/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton count={3} />;

  const stats = data?.stats || {};
  const todayClasses = data?.todayClasses || [];
  const profile = user?.profile || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Glassmorphic Faculty Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Faculty')}&background=4338ca&color=fff`
                }
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                  Welcome, {user?.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                  Faculty Portal
                </span>
                {user?.isHod && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/30 text-amber-100 border border-amber-300/40 px-2.5 py-0.5 rounded-full">
                    HOD
                  </span>
                )}
                {user?.isFa && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-400/30 text-purple-100 border border-purple-300/40 px-2.5 py-0.5 rounded-full">
                    Faculty Advisor (FA)
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100 mt-1 flex flex-wrap items-center gap-2 font-medium">
                <span className="font-mono font-bold text-white">{profile.employeeId || 'FAC-MCA-01'}</span>
                <span>•</span>
                <span>{profile.designation || 'Associate Professor'}</span>
                <span>•</span>
                <span>{profile.department?.name || 'Computer Applications'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {user?.isHod ? (
              <Link
                to="/faculty/timetable-management"
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md border border-white/20"
              >
                <Calendar className="w-4 h-4 text-white" /> Department Timetables
              </Link>
            ) : user?.isFa ? (
              <Link
                to="/faculty/timetable-management"
                className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <Calendar className="w-4 h-4 text-white" /> Class Timetable (FA)
              </Link>
            ) : null}

            <Link
              to="/faculty/attendance"
              className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5"
            >
              <Clock className="w-4 h-4 text-indigo-600" /> Mark Daily Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Classes Allocated Today"
          value={stats.classesToday || 0}
          subtitle="Timetable Sessions"
          icon={Calendar}
          color="indigo"
          trend="Scheduled Today"
          trendType="up"
        />
        <StatCard
          title="Attendance Pending"
          value={stats.pendingAttendance || 0}
          subtitle="Unmarked Periods"
          icon={Clock}
          color={stats.pendingAttendance > 0 ? 'rose' : 'emerald'}
          trend={stats.pendingAttendance > 0 ? 'Action Required' : 'All Recorded'}
          trendType={stats.pendingAttendance > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Study Materials"
          value={stats.totalMaterials || 0}
          subtitle="Uploaded Unit Modules"
          icon={Layers}
          color="sky"
          trend="Active Learning Hub"
          trendType="up"
        />
        <StatCard
          title="Course Assignments"
          value={stats.totalAssignments || 0}
          subtitle="Created Across Sections"
          icon={ClipboardList}
          color="amber"
          trend="Evaluated Submissions"
          trendType="up"
        />
      </div>

      {/* 3. Allocated Class Sessions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Today's Allocated Class Sessions
          </h3>
          <span className="text-xs text-slate-500 font-mono font-medium bg-slate-100 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Period & Time</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Class Section</th>
                <th className="py-3 px-3">Room</th>
                <th className="py-3 px-3 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayClasses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No classes scheduled for today. Check your weekly timetable for upcoming periods.
                  </td>
                </tr>
              ) : (
                todayClasses.map((c) => (
                  <tr key={c._id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-indigo-600">Period {c.periodNumber}</span>
                      <span className="text-slate-400 block text-[11px] font-mono">{c.startTime} - {c.endTime}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">{c.subject?.name}</span>
                      <span className="text-indigo-600 block font-mono text-[11px] font-bold">{c.subject?.code}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800">{c.classSection?.name}</span>
                      <span className="text-slate-400 block text-[11px]">Semester {c.classSection?.semester}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{c.roomNumber}</td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/faculty/attendance?classSectionId=${c.classSection?._id}&subjectId=${c.subject?._id}&periodNumber=${c.periodNumber}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        <span>Mark Attendance</span> <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

