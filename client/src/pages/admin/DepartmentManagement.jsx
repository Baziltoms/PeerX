import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Building,
  Users,
  Pencil,
  Trash2,
  ShieldCheck,
  Search,
  UserCheck,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    facultyUserId: '',
    description: '',
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    facultyUserId: '',
    description: '',
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [resDepts, resFac] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/faculty'),
      ]);
      setDepartments(resDepts.data || []);
      setFacultyList(resFac.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/departments', formData);
      showToast('Department created successfully!', 'success');
      setIsCreateModalOpen(false);
      setFormData({ name: '', code: '', facultyUserId: '', description: '' });
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setEditFormData({
      name: dept.name || '',
      code: dept.code || '',
      facultyUserId: dept.hodUser?._id || '',
      description: dept.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    setUpdating(true);
    try {
      const res = await api.put(`/admin/departments/${editingDept._id}`, editFormData);
      showToast(res.message || 'Department updated successfully!', 'success');
      setIsEditModalOpen(false);
      setEditingDept(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDelete = (dept) => {
    setDeptToDelete(dept);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!deptToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/departments/${deptToDelete._id}`);
      showToast(res.message || 'Department deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setDeptToDelete(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const hodName = dept.hodUser?.name || dept.hodName || '';
    return (
      dept.name?.toLowerCase().includes(q) ||
      dept.code?.toLowerCase().includes(q) ||
      hodName.toLowerCase().includes(q) ||
      dept.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              Department Management
            </h1>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              {departments.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure academic departments, codes, and assign or change Head of Department (HOD) affiliations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-indigo-200 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments by name, code, or HOD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Building className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
            {search ? 'No matching departments found' : 'No departments configured yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search
              ? 'Try modifying your search query to find the department you are looking for.'
              : 'Add your first academic department to configure course offerings and assign faculty.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => {
            const currentHodUser = dept.hodUser;
            const currentHodName = currentHodUser?.name || dept.hodName;
            const hasHod = Boolean(currentHodUser || dept.hodName);

            return (
              <div
                key={dept._id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Code & Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 rounded-lg">
                      {dept.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        title="Edit Department & HOD"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(dept)}
                        title="Delete Department"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Department Details */}
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {dept.description || 'No description added.'}
                  </p>
                </div>

                {/* HOD Status Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {currentHodName ? currentHodName.charAt(0) : '?'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Head of Department (HOD)
                        </span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {currentHodName || 'Pending Assignment'}
                        </p>
                        {currentHodUser?.email && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {currentHodUser.email}
                          </p>
                        )}
                      </div>
                    </div>
                    {currentHodUser ? (
                      <Badge variant="success" size="sm" className="shrink-0">
                        Active
                      </Badge>
                    ) : hasHod ? (
                      <Badge variant="sky" size="sm" className="shrink-0">
                        Assigned
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" className="shrink-0">
                        Pending
                      </Badge>
                    )}
                  </div>

                  {/* Edit/Change HOD Button */}
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                    {currentHodUser ? 'Change HOD / Edit' : 'Assign HOD / Edit'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Academic Department Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Academic Department"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Department of Information Science"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Code (Abbr) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ISE"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Head of Department (HOD)
              </label>
              <select
                value={formData.facultyUserId}
                onChange={(e) => setFormData((p) => ({ ...p, facultyUserId: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select Faculty Member (Optional) --</option>
                {facultyList.map((f) => {
                  const fUserId = f.user?._id || f._id;
                  const fName = f.user?.name || f.name;
                  return (
                    <option key={fUserId} value={fUserId}>
                      {fName} ({f.employeeId || f.designation || 'Faculty'}){f.department ? ` - ${f.department.code}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Brief overview of department courses, laboratories, and specialized disciplines..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Department & HOD Selection Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Edit Department'}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Department Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Code (Abbr) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSE"
                value={editFormData.code}
                onChange={(e) => setEditFormData((p) => ({ ...p, code: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Head of Department (HOD)</span>
                {editingDept?.hodUser && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Currently Assigned
                  </span>
                )}
              </label>
              <select
                value={editFormData.facultyUserId}
                onChange={(e) => setEditFormData((p) => ({ ...p, facultyUserId: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- No HOD Assigned / Unassign --</option>
                {facultyList.map((f) => {
                  const fUserId = f.user?._id || f._id;
                  const fName = f.user?.name || f.name;
                  const isCurrentDeptHod = editingDept?.hodUser?._id === fUserId;
                  return (
                    <option key={fUserId} value={fUserId}>
                      {fName} ({f.employeeId || f.designation || 'Faculty'}){f.department ? ` - ${f.department.code}` : ''} {isCurrentDeptHod ? '★ (Current HOD)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Current HOD Info Callout */}
          {editFormData.facultyUserId && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-indigo-950 dark:text-indigo-200 block">
                  HOD Role Assignment
                </span>
                <span className="text-indigo-700 dark:text-indigo-300 text-[11px]">
                  Saving changes will assign the selected faculty member as HOD, granting administrative oversight for {editFormData.name || 'this department'}.
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Brief overview of department courses, laboratories, and specialized disciplines..."
              value={editFormData.description}
              onChange={(e) => setEditFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {updating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Department Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Department"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Are you sure you want to delete this department?</p>
              <p className="text-[11px] opacity-90">
                Department <strong>{deptToDelete?.name} ({deptToDelete?.code})</strong> will be permanently removed.
                Note that departments with enrolled students or assigned faculty cannot be deleted.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteSubmit}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete Department'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
