import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Filter,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const FacultySchedule = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'today'
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [weeklyData, setWeeklyData] = useState({
    allocations: [],
    isFa: false,
    isHod: false,
    faClasses: [],
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const [todayRes, weeklyRes] = await Promise.all([
          api.get('/faculty/schedule/today'),
          api.get('/faculty/schedule/weekly'),
        ]);
        setTodaySchedule(todayRes.data || []);
        setWeeklyData(
          weeklyRes.data || {
            allocations: [],
            isFa: false,
            isHod: false,
            faClasses: [],
          }
        );
      } catch (err) {
        showToast(err.message || 'Failed to load teaching schedule.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) return <LoadingSkeleton count={4} />;

  const allocations = weeklyData.allocations || [];
  const isFa = weeklyData.isFa;
  const faClasses = weeklyData.faClasses || [];

  // Filter allocations by selected day
  const filteredAllocations =
    selectedDayFilter === 'All'
      ? allocations
      : allocations.filter((a) => a.dayOfWeek === selectedDayFilter);

  // Compute metrics
  const uniqueClasses = [
    ...new Set(allocations.map((a) => a.classSection?.name).filter(Boolean)),
  ];
  const uniqueSubjects = [
    ...new Set(allocations.map((a) => a.subject?.name).filter(Boolean)),
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-100 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                Faculty Teaching Timetable
              </h1>
              {isFa && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-400/30 text-purple-100 border border-purple-300/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-300" /> Faculty Advisor (FA)
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-100 mt-1 flex flex-wrap items-center gap-2 font-medium">
              <span>Official institutional period allocations and lecture rooms assigned in the timetable</span>
              <span>•</span>
              <span className="font-mono">{user?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-white text-indigo-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Weekly Timetable
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'today'
                  ? 'bg-white text-indigo-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Today's Schedule ({todaySchedule.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. FA Class Designation Callout Card (if FA) */}
      {isFa && faClasses.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 rounded-3xl p-5 border border-purple-200/80 dark:border-purple-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200 dark:shadow-none shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-sm text-purple-950 dark:text-purple-100">
                  Faculty Advisor Role Assigned
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200/70 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                  Class Scheduling Authority
                </span>
              </div>
              <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-0.5">
                You are assigned by the HOD as the Faculty Advisor for{' '}
                <strong>{faClasses.map((c) => c.name).join(', ')}</strong>. You are authorized to allocate period sessions and publish the class timetable.
              </p>
            </div>
          </div>

          <Link
            to="/faculty/timetable-management"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 transform hover:-translate-y-0.5"
          >
            Schedule Class Timetable <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Weekly Allocated Periods"
          value={allocations.length}
          subtitle="Total Teaching Sessions"
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Classes Allocated Today"
          value={todaySchedule.length}
          subtitle="Today's Sessions"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Classes Taught"
          value={uniqueClasses.length}
          subtitle={uniqueClasses.join(', ') || 'No Classes'}
          icon={Building}
          color="purple"
        />
        <StatCard
          title="Subjects Taught"
          value={uniqueSubjects.length}
          subtitle="Curriculum Load"
          icon={BookOpen}
          color="amber"
        />
      </div>

      {/* 4. Tab 1: Weekly Timetable View */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          {/* Day Filter Pills */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filter Day:
            </span>
            <button
              onClick={() => setSelectedDayFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDayFilter === 'All'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Days ({allocations.length})
            </button>
            {daysOfWeek.map((day) => {
              const count = allocations.filter((a) => a.dayOfWeek === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayFilter(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedDayFilter === day
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {day} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Allocation Cards Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {selectedDayFilter === 'All'
                  ? 'Complete Weekly Teaching Allocations'
                  : `Teaching Allocations for ${selectedDayFilter}`}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {filteredAllocations.length} total periods allocated
              </span>
            </div>

            {filteredAllocations.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  No teaching classes allocated for {selectedDayFilter === 'All' ? 'the week' : selectedDayFilter}.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Once your Faculty Advisor or HOD schedules your subjects into the timetable, they will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAllocations.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Day, Period, Time */}
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
                          {item.dayOfWeek} • Period {item.periodNumber}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>

                      {/* Subject Name & Code */}
                      <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                        {item.subject?.name || 'Assigned Subject'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {item.subject?.code}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {item.sessionType || 'Lecture'}
                        </span>
                      </div>

                      {/* Class Section Info */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-medium">
                          Class: <strong>{item.classSection?.name}</strong> (Sem {item.classSection?.semester})
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.department?.code || 'MCA'}
                        </span>
                      </div>
                    </div>

                    {/* Room & Status Footer */}
                    <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.roomNumber || item.classSection?.roomNumber || 'Hall 101'}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                        Allocated
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Today's Schedule View */}
      {activeTab === 'today' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Teaching Periods Allocated Today
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySchedule.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center col-span-3">
                No teaching classes scheduled for today in the official timetable. Enjoy your research and prep time!
              </p>
            ) : (
              todaySchedule.map((item) => (
                <div
                  key={item._id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      <span>Period {item.periodNumber}</span>
                      <span className="text-slate-400 font-normal">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.subject?.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.subject?.code} ({item.sessionType || 'Lecture'})
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                      Class: {item.classSection?.name} (Sem {item.classSection?.semester})
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.roomNumber}</span>
                    </div>

                    <Link
                      to="/faculty/attendance"
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Mark Attendance →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
