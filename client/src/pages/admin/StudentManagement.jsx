import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  UserCheck,
  UserX,
  GraduationCap,
  Pencil,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Provisioning Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    temporaryPassword: 'Student@123',
    departmentId: '',
    rollNumber: '',
    course: 'Master of Computer Applications (MCA)',
    semester: 4,
    graduationYear: 2026,
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    rollNumber: '',
    course: 'Master of Computer Applications (MCA)',
    semester: 4,
    graduationYear: 2026,
    cgpa: 8.5,
    isActive: true,
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchStudents = async () => {
    try {
      const [resStudents, resDepts] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/departments'),
      ]);
      setStudents(resStudents.data || []);
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
    fetchStudents();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      showToast(res.message, 'success');
      fetchStudents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    setProvisioning(true);

    try {
      await api.post('/admin/students', {
        ...formData,
      });
      showToast('Student provisioned successfully!', 'success');
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        temporaryPassword: 'Student@123',
        departmentId: departments[0]?._id || '',
        rollNumber: '',
        course: 'Master of Computer Applications (MCA)',
        semester: 4,
        graduationYear: 2026,
      });
      fetchStudents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProvisioning(false);
    }
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setShowPassword(false);
    setEditFormData({
      name: student.user?.name || '',
      email: student.user?.email || '',
      password: '',
      departmentId: student.department?._id || student.department || departments[0]?._id || '',
      rollNumber: student.rollNumber || '',
      course: student.course || 'Master of Computer Applications (MCA)',
      semester: student.semester || 4,
      graduationYear: student.graduationYear || 2026,
      cgpa: student.cgpa !== undefined ? student.cgpa : 8.5,
      isActive: student.user?.isActive ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setUpdating(true);

    try {
      const payload = { ...editFormData };
      // Omit empty password so we don't accidentally blank it out
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }

      const res = await api.put(`/admin/students/${editingStudent._id}`, payload);
      showToast(res.message || 'Student updated successfully!', 'success');
      setIsEditModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDelete = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/admin/students/${studentToDelete._id}`);
      showToast(res.message || 'Student removed successfully.', 'success');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents();
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
      header: 'Roll Number',
      accessor: 'rollNumber',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{row.rollNumber}</span>
      ),
    },
    {
      header: 'Student Name & Email',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img
            src={
              row.user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(row.user?.name || 'S')}&background=4f46e5&color=fff`
            }
            alt=""
            className="w-8 h-8 rounded-xl object-cover"
          />
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{row.user?.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">{row.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & Semester',
      accessor: 'department',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{row.department?.code}</span>
          <span className="text-slate-400 text-[11px] ml-1.5">• Sem {row.semester}</span>
        </div>
      ),
    },
    {
      header: 'CGPA',
      accessor: 'cgpa',
      render: (row) => (
        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {row.cgpa ? Number(row.cgpa).toFixed(2) : 'N/A'}
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
            title="Edit Student & Login Credentials"
            className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Active/Inactive */}
          <button
            onClick={() => handleToggleStatus(row.user?._id)}
            title={row.user?.isActive ? 'Suspend User' : 'Activate User'}
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
            title="Permanently Remove Student"
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
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Student Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administer institutional student rosters, credentials, profile details, and account provisioning
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Provision New Student
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        searchPlaceholder="Search by student name, roll number, email..."
      />

      {/* 1. Provision Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Student Account"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Provisioned accounts are immediately bound to this institution. The student can sign in using their official email and temporary password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Rohan Sharma"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Student Email</label>
              <input
                type="email"
                required
                placeholder="rohan@sngce.edu"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
              <input
                type="text"
                required
                placeholder="MCA-2024-045"
                value={formData.rollNumber}
                onChange={(e) => setFormData((p) => ({ ...p, rollNumber: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Department</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Course</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData((p) => ({ ...p, course: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData((p) => ({ ...p, graduationYear: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
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
              {provisioning ? 'Provisioning...' : 'Provision Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Student Modal with Email and Password management */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile & Credentials"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Basic Student Information */}
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={editFormData.rollNumber}
                onChange={(e) => setEditFormData((p) => ({ ...p, rollNumber: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Department</label>
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Program</label>
              <input
                type="text"
                value={editFormData.course}
                onChange={(e) => setEditFormData((p) => ({ ...p, course: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={editFormData.semester}
                onChange={(e) => setEditFormData((p) => ({ ...p, semester: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Graduation Year</label>
              <input
                type="number"
                value={editFormData.graduationYear}
                onChange={(e) => setEditFormData((p) => ({ ...p, graduationYear: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={editFormData.cgpa}
                onChange={(e) => setEditFormData((p) => ({ ...p, cgpa: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
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
                Login Email Address
              </label>
              <input
                type="email"
                required
                value={editFormData.email}
                onChange={(e) => setEditFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Changing this email will update the student's login identifier immediately.
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
                Enter a new password (min. 6 characters) to reset student's password, or leave empty to keep existing password.
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
        title="Remove Student Account"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
              <span className="font-bold">Permanent Deletion Warning:</span> This will permanently remove the student profile, academic affiliations, and login account from your institution.
            </div>
          </div>

          {studentToDelete && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{studentToDelete.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Roll Number:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{studentToDelete.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{studentToDelete.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Department:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {studentToDelete.department?.name} ({studentToDelete.department?.code})
                </span>
              </div>
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
              {deleting ? 'Removing...' : 'Delete Student'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentManagement;
