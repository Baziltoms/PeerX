import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, Download, FileText, Trash2, Eye } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const FacultyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [assignedData, setAssignedData] = useState({ subjects: [], classSections: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '',
    classSectionId: '',
    title: '',
    description: '',
    materialType: 'PDF',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    unitCategory: 'Unit 1',
  });

  const { showToast } = useToast();

  const fetchMaterials = async () => {
    try {
      const [matRes, assignedRes] = await Promise.all([
        api.get('/faculty/materials'),
        api.get('/faculty/assigned-classes'),
      ]);
      setMaterials(matRes.data || []);
      setAssignedData(assignedRes.data);

      if (assignedRes.data.subjects?.length > 0 && !formData.subjectId) {
        setFormData((p) => ({
          ...p,
          subjectId: assignedRes.data.subjects[0]._id,
          classSectionId: assignedRes.data.classSections[0]?._id || '',
        }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      await api.post('/faculty/materials', formData);
      showToast('Study material uploaded successfully!', 'success');
      setIsModalOpen(false);
      setFormData((p) => ({
        ...p,
        title: '',
        description: '',
      }));
      fetchMaterials();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Study Materials Repository</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload lecture notes, reference PDFs, and question banks categorized by syllabus unit
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Upload Material
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((m) => (
          <div key={m._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="sky" size="sm">{m.unitCategory}</Badge>
                <span className="text-[11px] font-mono text-slate-400">{m.materialType}</span>
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{m.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{m.description || 'Lecture resources.'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{m.subject?.name}</span>
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" /> View / Download
              </a>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Study Material">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData((p) => ({ ...p, subjectId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                {assignedData.subjects?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section</label>
              <select
                value={formData.classSectionId}
                onChange={(e) => setFormData((p) => ({ ...p, classSectionId: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                {assignedData.classSections?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} (Semester {c.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Material Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 1: Express Middleware & Routing Lifecycle"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Unit</label>
              <select
                value={formData.unitCategory}
                onChange={(e) => setFormData((p) => ({ ...p, unitCategory: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Unit 1">Unit 1</option>
                <option value="Unit 2">Unit 2</option>
                <option value="Unit 3">Unit 3</option>
                <option value="Unit 4">Unit 4</option>
                <option value="Unit 5">Unit 5</option>
                <option value="Previous Papers">Previous Year Papers</option>
                <option value="References">Reference Material</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Material Type</label>
              <select
                value={formData.materialType}
                onChange={(e) => setFormData((p) => ({ ...p, materialType: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="PDF">PDF Document</option>
                <option value="PPT">Presentation (PPT/PPTX)</option>
                <option value="DOC">Word Document</option>
                <option value="Notes">Lecture Notes</option>
                <option value="Video Link">Video Link</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="Lecture objectives, topics covered..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {uploading ? 'Uploading...' : 'Save Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
