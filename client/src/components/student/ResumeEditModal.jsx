import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Briefcase,
  Code,
  Layers,
  User,
  GraduationCap,
  RotateCcw,
  Save,
  ShieldCheck,
  Check,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';

export const ResumeEditModal = ({
  isOpen,
  onClose,
  resumeData,
  onSave,
  onReset,
  isSaving = false,
  initialTab = 'skills',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState(null);
  const [newSkillInput, setNewSkillInput] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    if (isOpen && resumeData) {
      setFormData(JSON.parse(JSON.stringify(resumeData)));
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, resumeData, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !formData) return null;

  // ---------------- Handlers for Contact / Bio ----------------
  const handleContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...(prev.contactInfo || {}),
        [field]: value,
      },
    }));
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ---------------- Handlers for Skills ----------------
  const handleAddSkillToCategory = (catIdx) => {
    const val = (newSkillInput[catIdx] || '').trim();
    if (!val) return;

    setFormData((prev) => {
      const skillsCopy = [...(prev.skills || [])];
      if (skillsCopy[catIdx]) {
        const items = [...(skillsCopy[catIdx].items || [])];
        if (!items.includes(val)) {
          items.push(val);
        }
        skillsCopy[catIdx] = { ...skillsCopy[catIdx], items };
      }
      return { ...prev, skills: skillsCopy };
    });

    setNewSkillInput((prev) => ({ ...prev, [catIdx]: '' }));
  };

  const handleRemoveSkill = (catIdx, itemIdx) => {
    setFormData((prev) => {
      const skillsCopy = [...(prev.skills || [])];
      if (skillsCopy[catIdx]) {
        const items = skillsCopy[catIdx].items.filter((_, idx) => idx !== itemIdx);
        skillsCopy[catIdx] = { ...skillsCopy[catIdx], items };
      }
      return { ...prev, skills: skillsCopy };
    });
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setFormData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { category: trimmed, items: [] }],
    }));
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const handleRemoveCategory = (catIdx) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((_, idx) => idx !== catIdx),
    }));
  };

  // ---------------- Handlers for Experience ----------------
  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          role: '',
          company: '',
          duration: '',
          location: '',
          description: '',
        },
      ],
    }));
  };

  const handleUpdateExperience = (idx, field, value) => {
    setFormData((prev) => {
      const expCopy = [...(prev.experience || [])];
      expCopy[idx] = { ...expCopy[idx], [field]: value };
      return { ...prev, experience: expCopy };
    });
  };

  const handleRemoveExperience = (idx) => {
    setFormData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== idx),
    }));
  };

  // ---------------- Handlers for Projects ----------------
  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          title: '',
          description: '',
          techStack: [],
          link: '',
        },
      ],
    }));
  };

  const handleUpdateProject = (idx, field, value) => {
    setFormData((prev) => {
      const projCopy = [...(prev.projects || [])];
      if (field === 'techStack') {
        const stackArr = typeof value === 'string'
          ? value.split(',').map((s) => s.trim()).filter(Boolean)
          : value;
        projCopy[idx] = { ...projCopy[idx], techStack: stackArr };
      } else {
        projCopy[idx] = { ...projCopy[idx], [field]: value };
      }
      return { ...prev, projects: projCopy };
    });
  };

  const handleRemoveProject = (idx) => {
    setFormData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== idx),
    }));
  };

  // ---------------- Handlers for Education ----------------
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          degree: '',
          institution: '',
          score: '',
          year: '',
        },
      ],
    }));
  };

  const handleUpdateEducation = (idx, field, value) => {
    setFormData((prev) => {
      const eduCopy = [...(prev.education || [])];
      eduCopy[idx] = { ...eduCopy[idx], [field]: value };
      return { ...prev, education: eduCopy };
    });
  };

  const handleRemoveEducation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== idx),
    }));
  };

  // ---------------- Handlers for Certifications ----------------
  const handleAddCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          title: '',
          issuer: '',
          year: '',
        },
      ],
    }));
  };

  const handleUpdateCertification = (idx, field, value) => {
    setFormData((prev) => {
      const certCopy = [...(prev.certifications || [])];
      certCopy[idx] = { ...certCopy[idx], [field]: value };
      return { ...prev, certifications: certCopy };
    });
  };

  const handleRemoveCertification = (idx) => {
    setFormData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== idx),
    }));
  };

  const tabs = [
    {
      id: 'skills',
      label: 'Skills',
      icon: Code,
      badge: (formData.skills || []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0),
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: Briefcase,
      badge: (formData.experience || []).length,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Layers,
      badge: (formData.projects || []).length,
    },
    {
      id: 'bio',
      label: 'Bio & Contact',
      icon: User,
    },
    {
      id: 'education',
      label: 'Education & Certs',
      icon: GraduationCap,
      badge: (formData.education || []).length + (formData.certifications || []).length,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-all duration-200">
      <div
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Customize Resume Content
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailor your skills, internships, experience, and projects for your dream career profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-slate-50/50 dark:bg-slate-800/20 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-indigo-700/80 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Technical & Professional Skills</h4>
                  <p className="text-slate-500 mt-0.5">
                    Organize your skills into categories. Add, remove, or type new skills directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200/60 dark:border-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </div>

              {/* Add New Category Box */}
              {showAddCategory && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/80 flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Cloud & DevOps, Databases, Tools & Platforms"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-2.5 py-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Skill Categories List */}
              <div className="space-y-4">
                {(formData.skills || []).map((cat, catIdx) => (
                  <div
                    key={catIdx}
                    className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const copy = [...prev.skills];
                              copy[catIdx].category = val;
                              return { ...prev, skills: copy };
                            });
                          }}
                          className="font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 focus:outline-none px-1 py-0.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(catIdx)}
                        className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete this category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Skill Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
                      {(cat.items || []).map((item, itemIdx) => (
                        <span
                          key={itemIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 font-medium text-xs"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(catIdx, itemIdx)}
                            className="hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Quick Add Skill Input */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                      <input
                        type="text"
                        placeholder="Add skill (e.g. TypeScript, Docker, Redis) and press Enter"
                        value={newSkillInput[catIdx] || ''}
                        onChange={(e) =>
                          setNewSkillInput((prev) => ({ ...prev, [catIdx]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkillToCategory(catIdx);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkillToCategory(catIdx)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Work Experience & Internships
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Highlight your industry internships, part-time developer roles, and freelance projects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {(!formData.experience || formData.experience.length === 0) && (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">No experience records yet</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Add your internships, software engineering fellowships, or freelance contracts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                  >
                    + Add Your First Experience
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {(formData.experience || []).map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4 relative group"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Experience #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                          Job Title / Role
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Full Stack Developer Intern"
                          value={exp.role || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. NexTech Solutions, Bangalore"
                          value={exp.company || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                          Duration / Period
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. June 2024 - August 2024 (or Present)"
                          value={exp.duration || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bengaluru, India / Remote"
                          value={exp.location || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                        Key Responsibilities, Contributions & Deliverables
                      </label>
                      <textarea
                        rows={3}
                        placeholder="• Architected microservices with Express & MongoDB&#10;• Implemented Redis caching layers reducing latency by 40%&#10;• Collaborated in weekly agile scrums..."
                        value={exp.description || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Software Engineering Projects</h4>
                  <p className="text-slate-500 mt-0.5">
                    Showcase systems, web applications, open-source repos, and academic projects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {(!formData.projects || formData.projects.length === 0) && (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">No projects added yet</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Add major portfolio projects to show recruiters your technical depth.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                  >
                    + Add Project
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {(formData.projects || []).map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4 relative group"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Project #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                          Project Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. PeerX - Academic & P2P Skill Platform"
                          value={proj.title || ''}
                          onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                          Project Link / GitHub URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. https://github.com/sngce/peerx"
                          value={proj.link || ''}
                          onChange={(e) => handleUpdateProject(idx, 'link', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                        Tech Stack (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, Node.js, Express, MongoDB, Tailwind CSS, JWT"
                        value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || '')}
                        onChange={(e) => handleUpdateProject(idx, 'techStack', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                        Description & Implementation Impact
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Architected role-based portals, sequential peer skill modules, strict attendance verification, and recruitment talent matchmaking."
                        value={proj.description || ''}
                        onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. BIO & CONTACT TAB */}
          {activeTab === 'bio' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Personal & Contact Information</h4>
                <p className="text-slate-500 mt-0.5">
                  Update your contact details, professional headline, and summary statement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.fullName || ''}
                    onChange={(e) => handleContactChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MCA Candidate | Full Stack Software Engineer"
                    value={formData.headline || ''}
                    onChange={(e) => handleFieldChange('headline', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo?.email || ''}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.phone || ''}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.location || ''}
                    onChange={(e) => handleContactChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.linkedin || ''}
                    onChange={(e) => handleContactChange('linkedin', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    GitHub Profile URL
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.github || ''}
                    onChange={(e) => handleContactChange('github', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                    Portfolio Website URL
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.portfolio || ''}
                    onChange={(e) => handleContactChange('portfolio', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-[11px] font-semibold mb-1">
                  Professional Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={formData.summary || ''}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  placeholder="Motivated MCA student with a strong foundation in data structures, web architectures, and full-stack software development..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 5. EDUCATION & CERTS TAB */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {/* Education Sub-section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Education History</h4>
                    <p className="text-slate-500 mt-0.5">Degrees, institutions, CGPA, and completion years.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200/60 dark:border-indigo-800"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Degree
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.education || []).map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">Degree #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                            Degree Title
                          </label>
                          <input
                            type="text"
                            placeholder="Master of Computer Applications (MCA)"
                            value={edu.degree || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                            Institution / College
                          </label>
                          <input
                            type="text"
                            placeholder="College Name"
                            value={edu.institution || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                            Score / CGPA
                          </label>
                          <input
                            type="text"
                            placeholder="CGPA: 8.8 / 10"
                            value={edu.score || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'score', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                            Batch / Year
                          </label>
                          <input
                            type="text"
                            placeholder="2024 - 2026"
                            value={edu.year || ''}
                            onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Sub-section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Certifications & Credentials
                    </h4>
                    <p className="text-slate-500 mt-0.5">Certificates, licenses, and verified courses.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCertification}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200/60 dark:border-indigo-800"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Credential
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.certifications || []).map((c, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          Credential #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(idx)}
                          className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                            Certification Title
                          </label>
                          <input
                            type="text"
                            placeholder="Full-Stack Specialization"
                            value={c.title || ''}
                            onChange={(e) => handleUpdateCertification(idx, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                            Issuing Organization
                          </label>
                          <input
                            type="text"
                            placeholder="Coursera / AWS"
                            value={c.issuer || ''}
                            onChange={(e) => handleUpdateCertification(idx, 'issuer', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">
                            Year
                          </label>
                          <input
                            type="text"
                            placeholder="2025"
                            value={c.year || ''}
                            onChange={(e) => handleUpdateCertification(idx, 'year', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="px-3 py-2 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            title="Restore auto-compiled values from your college academic profile"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Profile Defaults
          </button>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(formData)}
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-indigo-600/30 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving Changes...' : 'Save & Apply Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
