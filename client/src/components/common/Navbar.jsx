import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Building2,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Command,
  X,
  GraduationCap,
  Briefcase,
  Users,
  Shield,
  ArrowRight,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from '../../services/api.js';

export const Navbar = ({ toggleSidebar }) => {
  const { user, role, logout, quickDemoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Keyboard shortcut Ctrl+K / Cmd+K for command search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/communications/notifications');
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        // quiet fallback
      }
    };
    if (user) fetchNotifs();
  }, [user]);

  const handleSwitchDemoRole = async (targetRole) => {
    setShowRoleSwitcher(false);
    try {
      await quickDemoLogin(targetRole);
      showToast(`Switched to ${DEMO_ACCOUNTS[targetRole].label}`, 'success');
      navigate(`/${targetRole}/dashboard`);
    } catch (err) {
      showToast(`Failed to switch: ${err.message}`, 'error');
    }
  };

  const quickLinks = [
    { title: 'Student Dashboard', path: '/student/dashboard', role: 'student', icon: GraduationCap },
    { title: 'Peer Skill Exchange', path: '/student/skills', role: 'student', icon: BookOpen },
    { title: 'Faculty Attendance', path: '/faculty/attendance', role: 'faculty', icon: Users },
    { title: 'Talent Search', path: '/company/talent', role: 'company', icon: Briefcase },
    { title: 'Campus Analytics', path: '/admin/reports', role: 'admin', icon: Shield },
  ];

  const filteredQuickLinks = searchQuery
    ? quickLinks.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : quickLinks;

  const getRoleIcon = (r) => {
    switch (r) {
      case 'admin':
        return Shield;
      case 'faculty':
        return Users;
      case 'company':
        return Briefcase;
      case 'student':
      default:
        return GraduationCap;
    }
  };

  const RoleIcon = getRoleIcon(user?.role);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs h-16 px-4 sm:px-6 flex items-center justify-between transition-all no-print print:hidden">
        {/* Left: Mobile Menu + Command Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            className="relative w-full hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs text-slate-400 text-left transition-all group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="flex-1 font-medium">Search records, courses, notices...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Viva Switcher, Institution Tag, Notifications, User Menu */}
        <div className="flex items-center gap-2.5">
          
          
          {/* Institution Tag */}
          {user?.institution?.name && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/60 border border-slate-200 rounded-xl text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[140px] truncate font-medium">{user.institution.name}</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 group"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((s) => !s)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <span className="font-heading font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" /> Notifications
                  </span>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{unreadCount} unread</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 font-medium">All caught up! No unread notices.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 transition-colors text-xs border border-slate-100"
                      >
                        <p className="font-bold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((s) => !s)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200"
            >
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`}
                alt={user?.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  {user?.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 capitalize font-medium">
                  <RoleIcon className="w-3 h-3 text-indigo-600" />
                  <span>{user?.role}</span>
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-scale-in">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full capitalize">
                    {user?.role} Account
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out of PeerX</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fade-in-up">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
              <Search className="w-4 h-4 text-indigo-600" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search courses, students, pages, or commands..."
                className="flex-1 bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Quick Navigation Links
              </div>
              {filteredQuickLinks.map((link) => {
                const LinkIcon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => {
                      setShowSearchModal(false);
                      navigate(link.path);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50/80 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">{link.title}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{link.role} Module</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>Press ESC to close</span>
              <span>PeerX Quick Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

