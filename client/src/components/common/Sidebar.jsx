import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building,
  Megaphone,
  Calendar,
  AlertTriangle,
  CheckSquare,
  BarChart3,
  BookOpen,
  Share2,
  FileText,
  Clock,
  ClipboardList,
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = ({ isOpen, closeSidebar, openAiAssistant, isAiAssistantOpen }) => {
  const { role, user } = useAuth();
  const location = useLocation();

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Student Management', path: '/admin/students', icon: GraduationCap },
    { label: 'Faculty Management', path: '/admin/faculty', icon: Users },
    { label: 'Departments', path: '/admin/departments', icon: Building },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Events & Calendar', path: '/admin/events', icon: Calendar },
    { label: 'Grievance / Complaints', path: '/admin/complaints', icon: AlertTriangle },
    { label: 'Approvals Queue', path: '/admin/approvals', icon: CheckSquare },
    { label: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const studentNav = [
    { label: 'Home Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Academics & Timetable', path: '/student/academics', icon: BookOpen },
    { label: 'P2P Skill Exchange', path: '/student/skills', icon: Share2 },
    { label: 'Resume Generator', path: '/student/resume', icon: FileText },
    { label: 'Campus Grievance', path: '/student/complaints', icon: AlertTriangle },
  ];

  const isHodUser = Boolean(user?.isHod || user?.profile?.isHod);
  const isFaUser = Boolean(user?.isFa || user?.profile?.isFa || (user?.faClasses && user.faClasses.length > 0));

  const facultyNav = [
    { label: 'Home Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    ...(isHodUser
      ? [{ label: 'Department Timetables', path: '/faculty/timetable-management', icon: Clock }]
      : isFaUser
      ? [{ label: 'Class Timetable (FA)', path: '/faculty/timetable-management', icon: Clock }]
      : []),
    { label: 'Mark Attendance', path: '/faculty/attendance', icon: Clock },
    { label: 'Study Materials', path: '/faculty/materials', icon: Layers },
    { label: 'Assignments & Grading', path: '/faculty/assignments', icon: ClipboardList },
    { label: 'Schedule & Timetable', path: '/faculty/schedule', icon: Calendar },
  ];

  const companyNav = [
    { label: 'Recruiter Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Find Campus Talent', path: '/company/talent', icon: Search },
    { label: 'Recruitment Pipeline', path: '/company/pipeline', icon: Filter },
    { label: 'Job Opportunities', path: '/company/opportunities', icon: Briefcase },
  ];

  const activeRole = role || (
    location.pathname.startsWith('/admin')
      ? 'admin'
      : location.pathname.startsWith('/faculty')
      ? 'faculty'
      : location.pathname.startsWith('/company')
      ? 'company'
      : 'student'
  );

  let currentNav = [];
  if (activeRole === 'admin') currentNav = adminNav;
  else if (activeRole === 'faculty') currentNav = facultyNav;
  else if (activeRole === 'company') currentNav = companyNav;
  else currentNav = studentNav;

  const getPortalLabel = () => {
    if (activeRole === 'admin') return 'College Admin';
    if (activeRole === 'student') return 'Student';
    if (activeRole === 'company') return 'Recruiter';
    if (activeRole === 'faculty') {
      if (isHodUser && isFaUser) return 'HOD & FA';
      if (isHodUser) return 'HOD / Faculty';
      if (isFaUser) return 'Faculty Advisor (FA)';
      return 'Faculty';
    }
    return 'Student';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md lg:hidden transition-opacity no-print print:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-700 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800 shadow-card-light flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 no-print print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800 gap-3 bg-white dark:bg-slate-900">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-md shadow-indigo-200 dark:shadow-none">
            PX
          </div>
          <div>
            <span className="font-heading font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              PeerX <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 font-bold">v1.0</span>
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Academic & Skill Platform</p>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-5 py-3 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Active Portal
            </span>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 capitalize px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 shadow-2xs">
              {getPortalLabel()}
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-none">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => closeSidebar && closeSidebar()}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-none font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* AI Chatbot Launcher in Sidebar Left Bottom */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <button
            type="button"
            id="sidebar-ai-assistant-btn"
            onClick={() => {
              if (openAiAssistant) openAiAssistant();
              if (window.innerWidth < 1024 && closeSidebar) {
                closeSidebar();
              }
            }}
            className={`w-full relative group overflow-hidden p-2.5 rounded-2xl transition-all duration-200 text-left border ${
              isAiAssistantOpen
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/25 border-indigo-400/50 scale-[0.99]'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 border-transparent hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {/* Ambient decorative glow */}
            <div className="absolute -right-3 -bottom-3 w-14 h-14 bg-white/10 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Bot className="w-4.5 h-4.5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-xs text-white tracking-tight truncate">Campus AI</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-indigo-100 shrink-0">v1.0</span>
                  </div>
                  <p className="text-[10px] text-indigo-100/90 truncate font-medium">Ask questions & data</p>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0 ml-1 group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center bg-slate-50/50 dark:bg-slate-950/40">
          <p className="font-semibold text-slate-700 dark:text-slate-300">PeerX MCA Project 2026</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Academic & Recruitment Stack</p>
        </div>
      </aside>
    </>
  );
};

