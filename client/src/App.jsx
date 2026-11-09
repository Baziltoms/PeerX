import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterAdminPage } from './pages/auth/RegisterAdminPage.jsx';
import { RegisterCompanyPage } from './pages/auth/RegisterCompanyPage.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { StudentManagement } from './pages/admin/StudentManagement.jsx';
import { FacultyManagement } from './pages/admin/FacultyManagement.jsx';
import { DepartmentManagement } from './pages/admin/DepartmentManagement.jsx';
import { AnnouncementsManagement } from './pages/admin/AnnouncementsManagement.jsx';
import { EventsManagement } from './pages/admin/EventsManagement.jsx';
import { ComplaintsManagement } from './pages/admin/ComplaintsManagement.jsx';
import { ApprovalsManagement } from './pages/admin/ApprovalsManagement.jsx';
import { AnalyticsReports } from './pages/admin/AnalyticsReports.jsx';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.jsx';
import { StudentAcademics } from './pages/student/StudentAcademics.jsx';
import { SkillExchangeBrowse } from './pages/student/SkillExchangeBrowse.jsx';
import { SkillCourseView } from './pages/student/SkillCourseView.jsx';
import { ResumeGenerator } from './pages/student/ResumeGenerator.jsx';
import { StudentComplaints } from './pages/student/StudentComplaints.jsx';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard.jsx';
import { FacultyAttendance } from './pages/faculty/FacultyAttendance.jsx';
import { FacultyMaterials } from './pages/faculty/FacultyMaterials.jsx';
import { FacultyAssignments } from './pages/faculty/FacultyAssignments.jsx';
import { FacultySchedule } from './pages/faculty/FacultySchedule.jsx';
import { TimetableManagement } from './pages/faculty/TimetableManagement.jsx';

// Company Pages
import { CompanyDashboard } from './pages/company/CompanyDashboard.jsx';
import { FindTalent } from './pages/company/FindTalent.jsx';
import { CandidateDetail } from './pages/company/CandidateDetail.jsx';
import { RecruitmentPipeline } from './pages/company/RecruitmentPipeline.jsx';
import { OpportunitiesManagement } from './pages/company/OpportunitiesManagement.jsx';

// Fallback
import { NotFound } from './pages/NotFound.jsx';

/**
 * Route guard ensuring only users with specified role can access children.
 */
const RoleRoute = ({ allowedRole, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== allowedRole) {
    // Redirect to user's assigned dashboard
    const defaultDashboard = user?.role ? `/${user.role}/dashboard` : '/login';
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
};

/**
 * Redirects the root path `/` to role dashboard or login.
 */
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

export const App = () => {
  return (
    <Routes>
      {/* Root Redirection */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-admin" element={<RegisterAdminPage />} />
      <Route path="/register-company" element={<RegisterCompanyPage />} />

      {/* Authenticated Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        {/* Admin Section */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRole="admin">
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <RoleRoute allowedRole="admin">
              <StudentManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <RoleRoute allowedRole="admin">
              <FacultyManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <RoleRoute allowedRole="admin">
              <DepartmentManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <RoleRoute allowedRole="admin">
              <AnnouncementsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <RoleRoute allowedRole="admin">
              <EventsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <RoleRoute allowedRole="admin">
              <ComplaintsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <RoleRoute allowedRole="admin">
              <ApprovalsManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleRoute allowedRole="admin">
              <AnalyticsReports />
            </RoleRoute>
          }
        />

        {/* Student Section */}
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute allowedRole="student">
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student/academics"
          element={
            <RoleRoute allowedRole="student">
              <StudentAcademics />
            </RoleRoute>
          }
        />
        <Route
          path="/student/skills"
          element={
            <RoleRoute allowedRole="student">
              <SkillExchangeBrowse />
            </RoleRoute>
          }
        />
        <Route
          path="/student/skills/:courseId"
          element={
            <RoleRoute allowedRole="student">
              <SkillCourseView />
            </RoleRoute>
          }
        />
        <Route
          path="/student/resume"
          element={
            <RoleRoute allowedRole="student">
              <ResumeGenerator />
            </RoleRoute>
          }
        />
        <Route
          path="/student/complaints"
          element={
            <RoleRoute allowedRole="student">
              <StudentComplaints />
            </RoleRoute>
          }
        />

        {/* Faculty Section */}
        <Route
          path="/faculty/dashboard"
          element={
            <RoleRoute allowedRole="faculty">
              <FacultyDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/faculty/attendance"
          element={
            <RoleRoute allowedRole="faculty">
              <FacultyAttendance />
            </RoleRoute>
          }
        />
        <Route
          path="/faculty/materials"
          element={
            <RoleRoute allowedRole="faculty">
              <FacultyMaterials />
            </RoleRoute>
          }
        />
        <Route
          path="/faculty/assignments"
          element={
            <RoleRoute allowedRole="faculty">
              <FacultyAssignments />
            </RoleRoute>
          }
        />
        <Route
          path="/faculty/schedule"
          element={
            <RoleRoute allowedRole="faculty">
              <FacultySchedule />
            </RoleRoute>
          }
        />
        <Route
          path="/faculty/timetable-management"
          element={
            <RoleRoute allowedRole="faculty">
              <TimetableManagement />
            </RoleRoute>
          }
        />

        {/* Company Section */}
        <Route
          path="/company/dashboard"
          element={
            <RoleRoute allowedRole="company">
              <CompanyDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/company/talent"
          element={
            <RoleRoute allowedRole="company">
              <FindTalent />
            </RoleRoute>
          }
        />
        <Route
          path="/company/candidates/:studentUserId"
          element={
            <RoleRoute allowedRole="company">
              <CandidateDetail />
            </RoleRoute>
          }
        />
        <Route
          path="/company/pipeline"
          element={
            <RoleRoute allowedRole="company">
              <RecruitmentPipeline />
            </RoleRoute>
          }
        />
        <Route
          path="/company/opportunities"
          element={
            <RoleRoute allowedRole="company">
              <OpportunitiesManagement />
            </RoleRoute>
          }
        />
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
