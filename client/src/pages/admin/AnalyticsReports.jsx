import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const AnalyticsReports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = async (reportType) => {
    try {
      let dataToExport = [];
      let filename = `PeerX_${reportType}_Report.csv`;

      if (reportType === 'Students') {
        const res = await api.get('/admin/students');
        dataToExport = res.data.map((s) => ({
          RollNumber: s.rollNumber,
          Name: s.user?.name,
          Email: s.user?.email,
          Department: s.department?.code,
          Course: s.course,
          Semester: s.semester,
          CGPA: s.cgpa,
          Status: s.user?.isActive ? 'Active' : 'Inactive',
        }));
      } else if (reportType === 'Departments') {
        const res = await api.get('/admin/departments');
        dataToExport = res.data.map((d) => ({
          Name: d.name,
          Code: d.code,
          HOD: d.hodName,
        }));
      } else if (reportType === 'Faculty') {
        const res = await api.get('/admin/faculty');
        dataToExport = res.data.map((f) => ({
          EmployeeId: f.employeeId,
          Name: f.user?.name,
          Email: f.user?.email,
          Department: f.department?.code,
          Designation: f.designation,
        }));
      }

      if (dataToExport.length === 0) {
        showToast('No data available to export.', 'warning');
        return;
      }

      // Convert JSON array to CSV format
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map((row) =>
        Object.values(row)
          .map((v) => `"${(v || '').toString().replace(/"/g, '""')}"`)
          .join(',')
      );
      const csvContent = [headers, ...rows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${filename} successfully!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const chartData = analytics?.chartData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-heading font-bold text-slate-900">Communication Analytics & Institutional Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit communication engagement, student distribution, and generate compliance-ready CSV/JSON exports
        </p>
      </div>

      {/* Analytics Summary Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-heading font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Monthly Campus Communication Trajectory
        </h3>

        {/* Visual Bar Representation */}
        <div className="grid grid-cols-6 gap-3 items-end h-48 pt-6 pb-2 border-b border-slate-100">
          {chartData.map((item, i) => {
            const total = item.announcements + item.events + item.complaints;
            const heightPct = Math.min(100, Math.round((total / 35) * 100));

            return (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-slate-400 font-semibold group-hover:text-indigo-600 transition-colors">
                  {total}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[42px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-300 group-hover:from-indigo-700 group-hover:to-indigo-500 shadow-sm"
                ></div>
                <span className="text-xs font-semibold text-slate-600">{item.month}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span>Total Circulars & Notices</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
            <span>Events & Grievances</span>
          </div>
        </div>
      </div>

      {/* Export Reports Architecture Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-heading font-bold text-sm text-slate-900 mb-2">
          Downloadable Compliance & Accreditation Reports
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Generate structured audit reports for NAAC / NBA documentation, internal quality audits, and semester reviews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-xs text-slate-900 mb-1">Student Enrollment Roster</h4>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Complete institutional list of active students, roll numbers, courses, semesters, and CGPAs.
              </p>
            </div>
            <button
              onClick={() => handleExportCSV('Students')}
              className="w-full py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export Student CSV
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-xs text-slate-900 mb-1">Faculty Academic Roster</h4>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Faculty listings categorized by employee ID, assigned department, designation, and qualification.
              </p>
            </div>
            <button
              onClick={() => handleExportCSV('Faculty')}
              className="w-full py-2 bg-white hover:bg-slate-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export Faculty CSV
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-xs text-slate-900 mb-1">Departments Summary</h4>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Academic department hierarchy, department codes, and affiliated Head of Department records.
              </p>
            </div>
            <button
              onClick={() => handleExportCSV('Departments')}
              className="w-full py-2 bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export Department CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
