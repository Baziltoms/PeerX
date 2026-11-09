import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  UserCheck,
  UserX,
  Users,
  Pencil,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Provisioning Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    temporaryPassword: 'Faculty@123',
    departmentId: '',
    employeeId: '',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. in Computer Applications',
    experienceYears: 5,
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    employeeId: '',
    designation: 'Assistant Professor',
    qualification: '',
    experienceYears: 5,
    isActive: true,
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchFaculty = async () => {
    try {
      const [resFaculty, resDepts] = await Promise.all([
        api.get('/admin/faculty'),
        api.get('/admin/departments'),
      ]);
      setFaculty(resFaculty.data || []);
      setDepartments(resDepts.data || []);
      if (resDepts.data?.length > 0 && !formData.departmentId) {
        setFormData((p) => ({ ...p, departmentId: resDepts.data[0]._id }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      showToast(res.message, 'success');
      fetchFaculty();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    setProvisioning(true);

    try {
      await api.post('/admin/faculty', {
        ...formData,
      });
      showToast('Faculty provisioned successfully!', 'success');
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        temporaryPassword: 'Faculty@123',
        departmentId: departments[0]?._id || '',
        employeeId: '',
        designation: 'Assistant Professor',
        qualification: 'Ph.D. in Computer Applications',
        experienceYears: 5,
      });
      fetchFaculty();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProvisioning(false);
    }
  };

  const handleOpenEdit = (fac) => {
    setEditingFaculty(fac);
    setShowPassword(false);
    setEditFormData({
      name: fac.user?.name || '',
      email: fac.user?.email || '',
      password: '',
      departmentId: fac.department?._id || fac.department || departments[0]?._id || '',
      employeeId: fac.employeeId || '',
      designation: fac.designation || 'Assistant Professor',
      qualification: fac.qualification || '',
      experienceYears: fac.experienceYears !== undefined ? fac.experienceYears : 5,
      isActive: fac.user?.isActive ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setUpdating(true);

    try {
      const payload = { ...editFormData };
      // Omit empty password so existing password is untouched
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }

      const res = await api.put(`/admin/faculty/${editingFaculty._id}`, payload);
      showToast(res.message || 'Faculty member updated successfully!', 'success');
      setIsEditModalOpen(false);
      setEditingFaculty(null);
      fetchFaculty();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDelete = (fac) => {
    setFacultyToDelete(fac);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!facultyToDelete) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/admin/faculty/${facultyToDelete._id}`);
      showToast(res.message || 'Faculty member removed successfully.', 'success');
      setIsDeleteModalOpen(false);
      setFacultyToDelete(null);
      fetchFaculty();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditFormData((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{row.employeeId}</span>
      ),
    },
    {
      header: 'Faculty Member',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={
              row.user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(row.user?.name || 'F')}&background=4338ca&color=fff`
            }
            alt=""
            className="w-8 h-8 rounded-xl object-cover"
          />
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{row.user?.name}</span>
              {(row.isHod || row.user?.isHod) && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  HOD
                </span>
              )}
              {(row.isFa || row.user?.isFa) && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  FA
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">{row.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.department?.name} ({row.department?.code})
        </span>
      ),
    },
    {
      header: 'Designation',
      accessor: 'designation',
      render: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
          {row.designation}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.user?.isActive ? 'success' : 'danger'}>
          {row.user?.isActive ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {/* Edit Button */}
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Faculty & Login Credentials"
            className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Active/Inactive */}
          <button
            onClick={() => handleToggleStatus(row.user?._id)}
            title={row.user?.isActive ? 'Suspend Faculty' : 'Activate Faculty'}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              row.user?.isActive
                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {row.user?.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{row.user?.isActive ? 'Suspend' : 'Activate'}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => handleOpenDelete(row)}
            title="Permanently Remove Faculty"
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Faculty Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administer institutional faculty accounts, designations, department affiliations, and login credentials
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Provision New Faculty
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={faculty}
        searchPlaceholder="Search by faculty name, employee ID, email..."
      />

      {/* 1. Provision Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Faculty Account"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Anoopkumar M"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Faculty Email</label>
              <input
                type="email"
                required
                placeholder="faculty@sngce.edu"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
              <input
                type="text"
                required
                placeholder="FAC-MCA-05"
                value={formData.employeeId}
                onChange={(e) => setFormData((p) => ({ ...p, employeeId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData((p) => ({ ...p, departmentId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                required
                placeholder="Associate Professor"
                value={formData.designation}
                onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                placeholder="Ph.D. in Computer Applications"
                value={formData.qualification}
                onChange={(e) => setFormData((p) => ({ ...p, qualification: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
            <input
              type="text"
              required
              value={formData.temporaryPassword}
              onChange={(e) => setFormData((p) => ({ ...p, temporaryPassword: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={provisioning}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {provisioning ? 'Provisioning...' : 'Provision Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Faculty Modal with Email and Password management */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Faculty Member & Credentials"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
              <input
                type="text"
                required
                value={editFormData.employeeId}
                onChange={(e) => setEditFormData((p) => ({ ...p, employeeId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                required
                value={editFormData.departmentId}
                onChange={(e) => setEditFormData((p) => ({ ...p, departmentId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                required
                value={editFormData.designation}
                onChange={(e) => setEditFormData((p) => ({ ...p, designation: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={editFormData.qualification}
                onChange={(e) => setEditFormData((p) => ({ ...p, qualification: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={editFormData.experienceYears}
                onChange={(e) => setEditFormData((p) => ({ ...p, experienceYears: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Account Credentials Box */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Account Credentials (Email & Password)</span>
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                Security
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Login Email Address
              </label>
              <input
                type="email"
                required
                value={editFormData.email}
                onChange={(e) => setEditFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Updating this email will change the faculty member's portal login username immediately.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Generate Password
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Leave blank to keep existing password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full pl-3.5 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Enter a new password (min. 6 characters) to reset faculty password, or leave empty to keep current password.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {updating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Faculty Account"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
              <span className="font-bold">Permanent Deletion Warning:</span> This will permanently remove the faculty profile, course allocations, and login account from your institution.
            </div>
          </div>

          {facultyToDelete && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Faculty Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{facultyToDelete.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Employee ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{facultyToDelete.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{facultyToDelete.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Department:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {facultyToDelete.department?.name} ({facultyToDelete.department?.code})
                </span>
              </div>
              {(facultyToDelete.isHod || facultyToDelete.user?.isHod) && (
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 font-semibold text-[11px] flex items-center gap-1.5 mt-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>This faculty is currently Head of Department (HOD). Removing them will revoke HOD status.</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleting ? 'Removing...' : 'Delete Faculty'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyManagement;
