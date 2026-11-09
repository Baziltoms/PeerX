import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar.jsx';
import { Navbar } from '../components/common/Navbar.jsx';
import { AIAssistantDrawer } from '../components/common/AIAssistantDrawer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading PeerX Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200 print:bg-white print:block print:min-h-0 print:m-0 print:p-0">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        openAiAssistant={() => setAiAssistantOpen(true)}
        isAiAssistantOpen={aiAssistantOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 print:pl-0 print:block print:w-full print:m-0 print:p-0">
        <Navbar toggleSidebar={() => setSidebarOpen((o) => !o)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
          <Outlet />
        </main>

        {/* Grounded Campus AI Chatbot Drawer */}
        <AIAssistantDrawer
          isOpen={aiAssistantOpen}
          setIsOpen={setAiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
        />
      </div>
    </div>
  );
};
