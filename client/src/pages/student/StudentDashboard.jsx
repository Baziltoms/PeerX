import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Share2,
  FileText,
  Clock,
  AlertTriangle,
  Megaphone,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Bot,
  Zap,
  Award,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/students/dashboard-summary');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton count={4} />;

  const profile = data?.profile || {};
  const attendance = data?.attendance || {};
  const announcements = data?.announcements || [];
  const events = data?.upcomingEvents || [];
  const pendingAssignments = data?.pendingAssignments || [];

  const attPct = attendance.overallPercentage || 0;
  const isAttendanceSafe = attPct >= 75;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Glassmorphic Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff`
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
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-white">{profile.rollNumber || 'MCA-2024-001'}</span>
                <span>•</span>
                <span>{profile.course || 'MCA'} Master of Computer Applications</span>
                <span>•</span>
                <span>Semester {profile.semester || 4}</span>
              </p>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <Link
              to="/student/academics?tab=timetable"
              className="flex-1 md:flex-none px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-indigo-600" /> My Timetable
            </Link>
            <Link
              to="/student/skills"
              className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-indigo-200" /> Skill Exchange
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Academic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attPct}%`}
          subtitle={`${attendance.totalPresent || 0} of ${attendance.totalClasses || 0} sessions`}
          icon={Clock}
          color={isAttendanceSafe ? 'emerald' : 'rose'}
          trend={isAttendanceSafe ? 'Safe Zone (≥ 75%)' : 'Critical (Below 75%)'}
          trendType={isAttendanceSafe ? 'up' : 'down'}
        />
        <StatCard
          title="Academic CGPA"
          value={profile.cgpa ? profile.cgpa.toFixed(2) : '8.92'}
          subtitle="Semester 4 Aggregate"
          icon={BookOpen}
          color="indigo"
          trend="Top 10% Batch Ranking"
          trendType="up"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingAssignments.length}
          subtitle="Due in next 14 days"
          icon={Calendar}
          color="amber"
          trend="2 Assignments Due Soon"
          trendType="down"
        />
        <StatCard
          title="Peer Skills Enrolled"
          value={data?.activeSkillsCount || 1}
          subtitle="Active P2P Workshops"
          icon={Share2}
          color="sky"
          trend="+1 Certificate Earned"
          trendType="up"
        />
      </div>

      {/* 3. Pending Assignments & Campus AI Promo Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Submissions */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Pending Assignments & Tasks
            </h3>
            <Link to="/student/academics" className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingAssignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400 font-medium">
                No pending assignment deadlines! You are completely up to date.
              </div>
            ) : (
              pendingAssignments.map((a) => (
                <div
                  key={a._id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between gap-4 hover:border-indigo-200 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{a.title}</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                        {a.subject?.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Deadline: {new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <Link
                    to="/student/academics"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs shrink-0"
                  >
                    Submit Work
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Grounded AI Assistant Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-indigo-100 border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-3 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-white mb-1">
              Ask Campus Assistant
            </h3>
            <p className="text-xs text-indigo-100 leading-relaxed mb-4 font-medium">
              Get real-time answers about your attendance status, subject timetable, pending deadlines, and college notices grounded in live portal records.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white/15 text-xs text-white border border-white/20 flex items-center gap-2 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="font-medium">Grounded in live MCA course databases</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Latest Circulars & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circulars */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" /> Official College Circulars
            </h3>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{ann.title}</span>
                  <Badge variant={ann.priority === 'Urgent' ? 'danger' : 'neutral'} size="sm">
                    {ann.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> Upcoming Campus Events
            </h3>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-start justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">{ev.title}</span>
                  <p className="text-xs text-slate-500 mt-0.5">Venue: {ev.venue}</p>
                  <p className="text-[11px] text-indigo-600 font-bold mt-1">
                    {new Date(ev.startDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="sky" size="sm">{ev.category}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

