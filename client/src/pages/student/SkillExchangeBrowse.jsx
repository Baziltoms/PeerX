import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Share2,
  PlusCircle,
  Search,
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  Video,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Inbox,
  Send,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Plus,
  FileText,
  PlaySquare,
  HelpCircle,
  Check,
  Lock,
  Layers,
  PlayCircle,
  FileUp,
  Upload,
  Paperclip,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { generateSkillQuestions } from '../../utils/skillQuestionGenerator.js';

const YoutubeIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const SkillExchangeBrowse = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [learningSummary, setLearningSummary] = useState(null);
  const [tutorRequests, setTutorRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my_learning' | 'tutor_requests' | 'achievements'
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Join modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedCourseForJoin, setSelectedCourseForJoin] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requesting, setRequesting] = useState(false);

  // Reviewing action state
  const [reviewingId, setReviewingId] = useState(null);

  // Create course modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalTab, setModalTab] = useState('info'); // 'info' | 'modules' | 'evaluations'
  const [activeEvalTab, setActiveEvalTab] = useState('midterm'); // 'midterm' | 'final'

  const [courseForm, setCourseForm] = useState({
    title: '',
    skillName: '',
    description: '',
    skillLevel: 'intermediate',
    estimatedDuration: '3 Weeks',
    tags: 'React, Frontend, Web',
    meetingLink: 'https://meet.jit.si/PeerX-StudyRoom',
  });

  const [modules, setModules] = useState([
    {
      title: 'Module 1: Foundations & Architecture',
      description: 'Core concepts, component structures, and initial exercises.',
      lessons: [
        {
          title: 'Lesson 1.1: Component Design Principles',
          materialType: 'youtube',
          youtubeUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
          videoRecordingUrl: '',
          documentUrl: '',
          documentName: '',
          content: 'Introduction to foundational patterns and architectural best practices.',
          durationMinutes: 20,
        },
        {
          title: 'Lesson 1.2: Architecture Reference Guide',
          materialType: 'document',
          youtubeUrl: '',
          videoRecordingUrl: '',
          documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          documentName: 'Component-Architecture-Cheatsheet.pdf',
          content: 'Download and study the reference architecture PDF.',
          durationMinutes: 15,
        },
      ],
    },
    {
      title: 'Module 2: Advanced State & Optimization',
      description: 'Advanced patterns and production optimization unlocked after passing Mid-Term.',
      lessons: [
        {
          title: 'Lesson 2.1: Reducer & Context Patterns',
          materialType: 'youtube',
          youtubeUrl: 'https://www.youtube.com/watch?v=35lXWvCuM8o',
          videoRecordingUrl: '',
          documentUrl: '',
          documentName: '',
          content: 'Advanced implementation and state architecture.',
          durationMinutes: 30,
        },
        {
          title: 'Lesson 2.2: Live Optimization Recording',
          materialType: 'video_recording',
          youtubeUrl: '',
          videoRecordingUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          documentUrl: '',
          documentName: '',
          content: 'Hands-on live session recording examining render profiling.',
          durationMinutes: 25,
        },
      ],
    },
  ]);

  // Pre-load default 30 questions (15 midterm + 15 final)
  const defaultQuestions = generateSkillQuestions('React.js');
  const [midtermQuestions, setMidtermQuestions] = useState(defaultQuestions.midterm);
  const [finalQuestions, setFinalQuestions] = useState(defaultQuestions.final);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const [coursesRes, learningRes, requestsRes] = await Promise.all([
        api.get(`/skills/courses?search=${search}&skillLevel=${levelFilter}`),
        api.get('/skills/my-learning'),
        api.get('/skills/tutor/requests').catch(() => ({ data: [] })),
      ]);
      setCourses(coursesRes.data || []);
      setLearningSummary(learningRes.data || null);
      setTutorRequests(requestsRes.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, levelFilter]);

  const openJoinModal = (course) => {
    setSelectedCourseForJoin(course);
    setRequestMessage(`Hi ${course.tutor?.name || 'Tutor'}, I would like to join your ${course.skillName} course to build hands-on skills!`);
    setIsJoinModalOpen(true);
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!selectedCourseForJoin) return;
    setRequesting(true);

    try {
      await api.post(`/skills/courses/${selectedCourseForJoin._id}/request-join`, {
        requestMessage,
      });
      showToast('Join request submitted! The peer tutor will review your application.', 'success');
      setIsJoinModalOpen(false);
      await fetchCourses();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRequesting(false);
    }
  };

  const handleReviewRequest = async (enrollmentId, action) => {
    setReviewingId(enrollmentId);
    try {
      await api.patch(`/skills/requests/${enrollmentId}/review`, { action });
      showToast(action === 'accept' ? 'Join request accepted! Student can now access the course.' : 'Join request declined.', 'success');
      await fetchCourses();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReviewingId(null);
    }
  };

  // Module management handlers
  const handleAddModule = () => {
    const newModIndex = modules.length + 1;
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${newModIndex}: Deep Dive & Practical Work`,
        description: 'Advanced sequential unit.',
        lessons: [
          {
            title: `Lesson ${newModIndex}.1: Hands-on Practice`,
            materialType: 'youtube',
            youtubeUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
            videoRecordingUrl: '',
            documentUrl: '',
            documentName: '',
            content: 'Practical hands-on walkthrough.',
            durationMinutes: 20,
          },
        ],
      },
    ]);
    showToast(`Added Module ${newModIndex}!`, 'success');
  };

  const handleRemoveModule = (index) => {
    if (modules.length <= 2) {
      showToast('A course must have at least 2 modules for mid-term & final progression.', 'error');
      return;
    }
    setModules((prev) => prev.filter((_, i) => i !== index));
    showToast('Module removed.', 'info');
  };

  const handleAddLesson = (moduleIndex) => {
    setModules((prev) => {
      const next = [...prev];
      const targetMod = next[moduleIndex];
      targetMod.lessons.push({
        title: `Lesson ${moduleIndex + 1}.${targetMod.lessons.length + 1}: Study Resource`,
        materialType: 'youtube',
        youtubeUrl: '',
        videoRecordingUrl: '',
        documentUrl: '',
        documentName: '',
        content: '',
        durationMinutes: 20,
      });
      return next;
    });
  };

  const handleRemoveLesson = (moduleIndex, lessonIndex) => {
    setModules((prev) => {
      const next = [...prev];
      if (next[moduleIndex].lessons.length <= 1) {
        showToast('Each module must have at least 1 lesson/material.', 'error');
        return prev;
      }
      next[moduleIndex].lessons = next[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
      return next;
    });
  };

  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    setModules((prev) => {
      const next = [...prev];
      next[moduleIndex].lessons[lessonIndex] = {
        ...next[moduleIndex].lessons[lessonIndex],
        [field]: value,
      };
      return next;
    });
  };

  const [uploadingFiles, setUploadingFiles] = useState({});

  const handleFileUpload = async (e, modIdx, lesIdx, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `${modIdx}_${lesIdx}_${type}`;
    setUploadingFiles((prev) => ({ ...prev, [key]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.upload('/skills/upload-material', formData);
      const uploadedData = res.data;

      if (type === 'video_recording') {
        handleLessonChange(modIdx, lesIdx, 'videoRecordingUrl', uploadedData.fileUrl);
        handleLessonChange(modIdx, lesIdx, 'videoUrl', uploadedData.fileUrl);
        handleLessonChange(modIdx, lesIdx, 'uploadedVideoName', uploadedData.originalName);
        handleLessonChange(
          modIdx,
          lesIdx,
          'uploadedVideoSize',
          (uploadedData.size / (1024 * 1024)).toFixed(1)
        );
        showToast(`Video recording "${uploadedData.originalName}" uploaded successfully!`, 'success');
      } else if (type === 'document') {
        handleLessonChange(modIdx, lesIdx, 'documentUrl', uploadedData.fileUrl);
        handleLessonChange(modIdx, lesIdx, 'resourcePdfUrl', uploadedData.fileUrl);
        handleLessonChange(modIdx, lesIdx, 'documentName', uploadedData.originalName || file.name);
        handleLessonChange(
          modIdx,
          lesIdx,
          'uploadedDocSize',
          (uploadedData.size / 1024).toFixed(0)
        );
        showToast(`Document "${uploadedData.originalName}" uploaded successfully!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'File upload failed. Please try again.', 'error');
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [key]: false }));
      e.target.value = '';
    }
  };

  // Evaluation Question handlers
  const handleAutoGenerateQuestions = () => {
    const generated = generateSkillQuestions(courseForm.skillName || 'React.js');
    setMidtermQuestions(generated.midterm);
    setFinalQuestions(generated.final);
    showToast(`Loaded 30 evaluation questions tailored for ${courseForm.skillName || 'Skill'} (15 Mid-Term + 15 Final)!`, 'success');
  };

  const handleAddQuestion = (type) => {
    const newQ = {
      questionText: `New Question: Conceptual check on core principles...`,
      options: ['Option A (Correct Answer)', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      points: 10,
    };
    if (type === 'midterm') {
      setMidtermQuestions((prev) => [...prev, newQ]);
    } else {
      setFinalQuestions((prev) => [...prev, newQ]);
    }
    showToast('Question added.', 'info');
  };

  const handleRemoveQuestion = (type, index) => {
    if (type === 'midterm') {
      setMidtermQuestions((prev) => prev.filter((_, i) => i !== index));
    } else {
      setFinalQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (type, qIndex, field, value) => {
    if (type === 'midterm') {
      setMidtermQuestions((prev) => {
        const next = [...prev];
        next[qIndex] = { ...next[qIndex], [field]: value };
        return next;
      });
    } else {
      setFinalQuestions((prev) => {
        const next = [...prev];
        next[qIndex] = { ...next[qIndex], [field]: value };
        return next;
      });
    }
  };

  const handleOptionChange = (type, qIndex, optIndex, value) => {
    if (type === 'midterm') {
      setMidtermQuestions((prev) => {
        const next = [...prev];
        const opts = [...next[qIndex].options];
        opts[optIndex] = value;
        next[qIndex] = { ...next[qIndex], options: opts };
        return next;
      });
    } else {
      setFinalQuestions((prev) => {
        const next = [...prev];
        const opts = [...next[qIndex].options];
        opts[optIndex] = value;
        next[qIndex] = { ...next[qIndex], options: opts };
        return next;
      });
    }
  };

  const handleSetCorrectOption = (type, qIndex, optIndex) => {
    if (type === 'midterm') {
      setMidtermQuestions((prev) => {
        const next = [...prev];
        next[qIndex] = { ...next[qIndex], correctOptionIndex: optIndex };
        return next;
      });
    } else {
      setFinalQuestions((prev) => {
        const next = [...prev];
        next[qIndex] = { ...next[qIndex], correctOptionIndex: optIndex };
        return next;
      });
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (modules.length < 2) {
      showToast('At least 2 modules are required for sequential course progression.', 'error');
      setModalTab('modules');
      return;
    }

    const totalQuestions = midtermQuestions.length + finalQuestions.length;
    if (totalQuestions < 30) {
      showToast(
        `Evaluation requires a minimum of 30 questions total across Mid-Term and Final evaluations (currently ${totalQuestions}/30). Click "✨ Auto-Generate Questions" to populate 30 questions.`,
        'error'
      );
      setModalTab('evaluations');
      return;
    }

    if (midtermQuestions.length === 0 || finalQuestions.length === 0) {
      showToast('Both Mid-Term and Final evaluations must have questions.', 'error');
      setModalTab('evaluations');
      return;
    }

    setCreating(true);

    try {
      await api.post('/skills/courses', {
        title: courseForm.title,
        skillName: courseForm.skillName,
        description: courseForm.description,
        skillLevel: courseForm.skillLevel,
        estimatedDuration: courseForm.estimatedDuration,
        tags: courseForm.tags ? courseForm.tags.split(',').map((t) => t.trim()) : [],
        meetingLink: courseForm.meetingLink,
        modules,
        evaluations: {
          midterm: {
            title: `${courseForm.skillName || 'Skill'} Mid-Term Assessment`,
            passingScore: 60,
            questions: midtermQuestions,
          },
          final: {
            title: `${courseForm.skillName || 'Skill'} Final Mastery Evaluation`,
            passingScore: 60,
            questions: finalQuestions,
          },
        },
      });

      showToast('Skill course created successfully with sequential modules, rich materials, and mid-term/final evaluations!', 'success');
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const tutorRank = learningSummary?.tutorRank || { rankTier: 'Starter Tutor', totalPoints: 100, averageRating: 5.0 };
  const enrollments = learningSummary?.enrollments || [];
  const achievements = learningSummary?.achievements || [];
  const pendingRequests = tutorRequests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Peer-to-Peer Skill Exchange</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Learn high-demand skills from student tutors with sequential module unlocking, join approvals, and verifiable skill cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Teach a Skill (Tutor)
          </button>
        </div>
      </div>

      {/* Tutor Gamification Status Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white p-5 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-amber-300 shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-white">Your Tutor Standing:</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-amber-300 border border-white/30 text-xs font-bold backdrop-blur-sm">
                {tutorRank.rankTier}
              </span>
            </div>
            <p className="text-xs text-indigo-100 mt-0.5 font-medium flex items-center gap-2">
              <span>Points: <strong className="text-white">{tutorRank.totalPoints} pts</strong></span>
              <span>•</span>
              <span>Students: <strong className="text-white">{tutorRank.totalStudentsTaught || 0}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300 inline" />
                <strong className="text-white">{tutorRank.averageRating?.toFixed(1) || '5.0'}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-white bg-white/15 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-sm font-medium">
          <span>Tiers:</span>
          <span className="text-indigo-200">Starter</span> →
          <span className="text-indigo-100">Skilled</span> →
          <span className="text-white">Expert</span> →
          <span className="text-amber-300 font-bold">Mentor</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'browse' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Explore All Skills ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('my_learning')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'my_learning' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Enrolled Courses ({enrollments.length})
        </button>
        <button
          onClick={() => setActiveTab('tutor_requests')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'tutor_requests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Tutor Review Hub</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            activeTab === 'achievements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Verified Skill Cards ({achievements.length})
        </button>
      </div>

      {/* Tab: Browse Courses */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by skill (React, Python, Tailwind, Docker, MERN...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 shadow-sm w-full sm:w-48 text-slate-700"
            >
              <option value="">All Skill Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const isTutor = course.tutor?._id === user?._id;
              const enrollment = enrollments.find((e) => e.skillExchange?._id === course._id);
              const isPending = enrollment?.status === 'pending';
              const isAccepted = enrollment && ['active', 'accepted', 'completed'].includes(enrollment.status);

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                        {course.skillName}
                      </span>
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {course.skillLevel}
                      </Badge>
                    </div>

                    <h3 className="font-heading font-bold text-sm text-slate-900 mb-1.5 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Tutor info */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <img
                        src={course.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.tutor?.name || 'Tutor')}&background=4f46e5&color=fff`}
                        alt=""
                        className="w-7 h-7 rounded-xl object-cover"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">{course.tutor?.name}</span>
                        <span className="text-slate-400 ml-1 text-[11px]">(Peer Tutor)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {course.ratingAverage?.toFixed(1) || '5.0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {course.estimatedDuration}
                      </span>
                    </div>

                    {isTutor ? (
                      <Link
                        to={`/student/skills/${course._id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Manage Course
                      </Link>
                    ) : isPending ? (
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Request Pending
                      </span>
                    ) : isAccepted ? (
                      <Link
                        to={`/student/skills/${course._id}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        Continue <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => openJoinModal(course)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Request to Join
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Tutor Review Hub */}
      {activeTab === 'tutor_requests' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 leading-relaxed flex items-start gap-2.5">
            <Inbox className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Peer Tutor Join Request Review:</strong> Students interested in your published skills submit requests to join. Review and accept requests to unlock Module 1 for enrolled learners.
            </div>
          </div>

          {tutorRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-xs text-slate-400">
              No join requests received yet. Publish more skill courses to attract peer learners!
            </div>
          ) : (
            <div className="space-y-3">
              {tutorRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={req.learner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.learner?.name || 'S')}&background=4f46e5&color=fff`}
                      alt=""
                      className="w-10 h-10 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-slate-900">{req.learner?.name}</h4>
                        <span className="text-[11px] text-slate-400">({req.learner?.email})</span>
                        <Badge variant={req.status === 'active' ? 'success' : req.status === 'rejected' ? 'danger' : 'amber'}>
                          {req.status === 'active' ? 'Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending Review'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600">
                        Applying for: <strong className="text-indigo-600 font-semibold">{req.skillExchange?.title}</strong> ({req.skillExchange?.skillName})
                      </p>

                      {req.requestMessage && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                          "{req.requestMessage}"
                        </p>
                      )}

                      <span className="text-[10px] text-slate-400 block">
                        Requested on {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleReviewRequest(req._id, 'reject')}
                        disabled={reviewingId === req._id}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req._id, 'accept')}
                        disabled={reviewingId === req._id}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept Student
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 shrink-0 font-medium">
                      Reviewed on {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: My Enrolled Courses */}
      {activeTab === 'my_learning' && (
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-xs text-slate-400">
              You have not enrolled in any courses yet. Explore peer skills and submit join requests!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((en) => {
                const isPending = en.status === 'pending';
                const isCompleted = en.status === 'completed';

                return (
                  <div key={en._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={isCompleted ? 'success' : isPending ? 'amber' : 'sky'}>
                          {isCompleted ? 'Course Completed' : isPending ? 'Request Pending Tutor Review' : `Module ${en.currentModuleOrder} Active`}
                        </Badge>
                        <span className="text-xs font-bold text-slate-800">{en.progressPercentage}% Complete</span>
                      </div>

                      <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">{en.skillExchange?.title}</h3>
                      <p className="text-xs text-slate-500 mb-3">Tutor: {en.tutor?.name}</p>

                      <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                        <div
                          style={{ width: `${en.progressPercentage}%` }}
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/student/skills/${en.skillExchange?._id}`}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold text-center transition-colors block"
                    >
                      {isPending ? 'View Request Status' : 'Open Learning Portal'}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Verified Skill Cards */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {achievements.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-xs text-slate-400">
              No skill cards earned yet. Complete all modules, pass midpoint & final evaluations to receive your digital card!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {achievements.map((ach) => (
                <div key={ach._id} className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 pointer-events-none"></div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {ach.verificationCode}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-slate-900 mb-0.5">{ach.skillName}</h4>
                    <p className="text-xs text-amber-600 font-bold mb-2">
                      Assessed Level: {ach.assessedLevel || ach.skillLevel}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Mastery Score: <strong className="text-indigo-600 font-bold">{ach.scoreAchieved}%</strong>
                    </p>
                  </div>

                  <Link
                    to={`/student/skills/${ach.skillExchange?._id || ach.skillExchange}`}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>View & Download Card</span> <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request to Join Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Request to Join Peer Course"
      >
        <form onSubmit={handleSendJoinRequest} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Interested in learning <strong className="text-slate-900">{selectedCourseForJoin?.skillName}</strong> from{' '}
            <strong className="text-slate-900">{selectedCourseForJoin?.tutor?.name}</strong>? Submit your request to join. Once accepted by the tutor, you will unlock Module 1.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message to Peer Tutor</label>
            <textarea
              rows="3"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              placeholder="Introduce yourself and your learning goals..."
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsJoinModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requesting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {requesting ? 'Sending...' : 'Submit Join Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Teach a Skill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish a Peer Skill Course"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreateCourse} className="space-y-5">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setModalTab('info')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'info'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Course Details</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab('modules')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'modules'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Modules & Materials ({modules.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setModalTab('evaluations')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                modalTab === 'evaluations'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Evaluations ({midtermQuestions.length + finalQuestions.length}/30 min)</span>
              {midtermQuestions.length + finalQuestions.length >= 30 ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </button>
          </div>

          {/* TAB 1: COURSE INFO */}
          {modalTab === 'info' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-xs text-slate-500 leading-relaxed bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl">
                As a peer tutor, you structure lessons into sequential modules. Interested peers submit requests to join, and you review each application before learners unlock Module 1.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mastering React 18 & Full-Stack Patterns"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Core Skill Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React.js"
                    value={courseForm.skillName}
                    onChange={(e) => setCourseForm((p) => ({ ...p, skillName: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Level</label>
                  <select
                    value={courseForm.skillLevel}
                    onChange={(e) => setCourseForm((p) => ({ ...p, skillLevel: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={courseForm.estimatedDuration}
                    onChange={(e) => setCourseForm((p) => ({ ...p, estimatedDuration: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Description & Outcomes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="What will learners accomplish in this workshop? Prerequisites..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Live Study Room Meeting Link</span>
                    <span className="text-[10px] text-indigo-600 font-normal">Jitsi / Google Meet / Zoom</span>
                  </label>
                  <input
                    type="text"
                    value={courseForm.meetingLink}
                    onChange={(e) => setCourseForm((p) => ({ ...p, meetingLink: e.target.value }))}
                    placeholder="https://meet.jit.si/PeerX-... or https://meet.google.com/..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    ℹ️ On Jitsi, click "Log-in" with Google/GitHub to start as Moderator.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={courseForm.tags}
                    onChange={(e) => setCourseForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="React, Frontend, Web"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalTab('modules')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Continue to Modules & Materials</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MODULES & MATERIALS */}
          {modalTab === 'modules' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Sequential Learning Architecture ({modules.length} Modules)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    First half unlocks sequentially upon tutor acceptance. Second half strictly unlocks only after passing the Mid-Term Evaluation with ≥ 60%.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Module
                </button>
              </div>

              {/* Module Cards */}
              <div className="space-y-4">
                {modules.map((mod, modIdx) => {
                  const midpointOrder = Math.max(1, Math.ceil(modules.length / 2));
                  const isSecondHalf = modIdx + 1 > midpointOrder;

                  return (
                    <div
                      key={modIdx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSecondHalf
                          ? 'bg-amber-50/20 border-amber-200/80 shadow-xs'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Module Header */}
                      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                            {modIdx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900">Module {modIdx + 1}</span>
                            <span
                              className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                modIdx === 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isSecondHalf
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {modIdx === 0
                                ? 'Unlocked Initially'
                                : isSecondHalf
                                ? 'Second Half • Mid-Term Gated (≥60%)'
                                : 'First Half • Sequential'}
                            </span>
                          </div>
                        </div>

                        {modules.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(modIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove this module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Module Title & Description Inputs */}
                      <div className="space-y-2 mb-3">
                        <input
                          type="text"
                          required
                          placeholder={`e.g. Module ${modIdx + 1}: Core Fundamentals`}
                          value={mod.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setModules((prev) => {
                              const n = [...prev];
                              n[modIdx].title = val;
                              return n;
                            });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Module outcomes and brief description..."
                          value={mod.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setModules((prev) => {
                              const n = [...prev];
                              n[modIdx].description = val;
                              return n;
                            });
                          }}
                          className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Materials / Lessons in this Module */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            Materials & Lessons ({mod.lessons?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(modIdx)}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Material / Resource
                          </button>
                        </div>

                        {/* List of Materials */}
                        <div className="space-y-2">
                          {(mod.lessons || []).map((les, lesIdx) => (
                            <div
                              key={lesIdx}
                              className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-mono font-bold text-slate-500">
                                  {modIdx + 1}.{lesIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  required
                                  placeholder="Material / Lesson Title..."
                                  value={les.title}
                                  onChange={(e) =>
                                    handleLessonChange(modIdx, lesIdx, 'title', e.target.value)
                                  }
                                  className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                                />

                                {mod.lessons.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLesson(modIdx, lesIdx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Remove this material"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Material Type Pills */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                                  Type:
                                </span>
                                {[
                                  { key: 'youtube', label: 'YouTube Video', icon: YoutubeIcon },
                                  { key: 'video_recording', label: 'Video Recording', icon: Video },
                                  { key: 'document', label: 'Document / PDF', icon: FileText },
                                  { key: 'article_notes', label: 'Code & Notes', icon: BookOpen },
                                ].map((typeItem) => {
                                  const IconComponent = typeItem.icon;
                                  const isSelected = (les.materialType || 'youtube') === typeItem.key;
                                  return (
                                    <button
                                      key={typeItem.key}
                                      type="button"
                                      onClick={() =>
                                        handleLessonChange(modIdx, lesIdx, 'materialType', typeItem.key)
                                      }
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white shadow-2xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <IconComponent className="w-3 h-3" />
                                      {typeItem.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Specific URL / Upload Fields based on type */}
                              <div className="space-y-2 pt-1 text-xs">
                                {les.materialType === 'youtube' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="sm:col-span-2">
                                      <input
                                        type="text"
                                        placeholder="YouTube Video Link (e.g. https://www.youtube.com/watch?v=...)"
                                        value={les.youtubeUrl || les.videoUrl || ''}
                                        onChange={(e) => {
                                          handleLessonChange(modIdx, lesIdx, 'youtubeUrl', e.target.value);
                                          handleLessonChange(modIdx, lesIdx, 'videoUrl', e.target.value);
                                        }}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="number"
                                        min="5"
                                        max="180"
                                        placeholder="Duration (mins)"
                                        value={les.durationMinutes || 20}
                                        onChange={(e) =>
                                          handleLessonChange(
                                            modIdx,
                                            lesIdx,
                                            'durationMinutes',
                                            Number(e.target.value) || 20
                                          )
                                        }
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                      />
                                    </div>
                                  </div>
                                )}

                                {les.materialType === 'video_recording' && (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="sm:col-span-2">
                                        {les.videoRecordingUrl ? (
                                          <div className="p-2.5 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                                                <Video className="w-3.5 h-3.5" />
                                              </div>
                                              <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                  <p className="text-xs font-bold text-purple-900 truncate">
                                                    {les.uploadedVideoName || les.videoRecordingUrl.split('/').pop()}
                                                  </p>
                                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-200 text-purple-800 shrink-0">
                                                    Video Ready
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-purple-700 truncate">
                                                  {les.uploadedVideoSize ? `${les.uploadedVideoSize} MB • ` : ''}
                                                  {les.videoRecordingUrl}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <label className="cursor-pointer px-2 py-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold transition-colors">
                                                Replace
                                                <input
                                                  type="file"
                                                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                                                  className="hidden"
                                                  onChange={(e) =>
                                                    handleFileUpload(e, modIdx, lesIdx, 'video_recording')
                                                  }
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  handleLessonChange(modIdx, lesIdx, 'videoRecordingUrl', '');
                                                  handleLessonChange(modIdx, lesIdx, 'videoUrl', '');
                                                  handleLessonChange(modIdx, lesIdx, 'uploadedVideoName', '');
                                                }}
                                                className="p-1 hover:bg-purple-100 text-purple-600 rounded-lg"
                                                title="Remove video"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="space-y-1.5">
                                            {/* Direct Video File Upload */}
                                            <label
                                              className={`border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/80 p-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                                uploadingFiles[`${modIdx}_${lesIdx}_video_recording`]
                                                  ? 'opacity-60 cursor-not-allowed'
                                                  : ''
                                              }`}
                                            >
                                              <Upload className="w-4 h-4 text-purple-600 shrink-0" />
                                              <span className="text-xs font-semibold text-purple-800">
                                                {uploadingFiles[`${modIdx}_${lesIdx}_video_recording`]
                                                  ? 'Uploading Video Recording...'
                                                  : 'Upload Video Recording (MP4, WebM up to 100MB)'}
                                              </span>
                                              <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                                                className="hidden"
                                                disabled={uploadingFiles[`${modIdx}_${lesIdx}_video_recording`]}
                                                onChange={(e) =>
                                                  handleFileUpload(e, modIdx, lesIdx, 'video_recording')
                                                }
                                              />
                                            </label>

                                            {/* Link Fallback */}
                                            <input
                                              type="text"
                                              placeholder="Or paste external video URL (e.g. https://.../video.mp4)"
                                              value={les.videoRecordingUrl || les.videoUrl || ''}
                                              onChange={(e) => {
                                                handleLessonChange(modIdx, lesIdx, 'videoRecordingUrl', e.target.value);
                                                handleLessonChange(modIdx, lesIdx, 'videoUrl', e.target.value);
                                              }}
                                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                                            />
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <input
                                          type="number"
                                          min="5"
                                          max="180"
                                          placeholder="Duration (mins)"
                                          value={les.durationMinutes || 20}
                                          onChange={(e) =>
                                            handleLessonChange(
                                              modIdx,
                                              lesIdx,
                                              'durationMinutes',
                                              Number(e.target.value) || 20
                                            )
                                          }
                                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {les.materialType === 'document' && (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="sm:col-span-2">
                                        {les.documentUrl ? (
                                          <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                                <FileText className="w-3.5 h-3.5" />
                                              </div>
                                              <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                  <p className="text-xs font-bold text-blue-900 truncate">
                                                    {les.documentName || les.documentUrl.split('/').pop()}
                                                  </p>
                                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-200 text-blue-800 shrink-0">
                                                    PDF / Doc Ready
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-blue-700 truncate">
                                                  {les.uploadedDocSize ? `${les.uploadedDocSize} KB • ` : ''}
                                                  {les.documentUrl}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <label className="cursor-pointer px-2 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-colors">
                                                Replace
                                                <input
                                                  type="file"
                                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf"
                                                  className="hidden"
                                                  onChange={(e) =>
                                                    handleFileUpload(e, modIdx, lesIdx, 'document')
                                                  }
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  handleLessonChange(modIdx, lesIdx, 'documentUrl', '');
                                                  handleLessonChange(modIdx, lesIdx, 'resourcePdfUrl', '');
                                                  handleLessonChange(modIdx, lesIdx, 'documentName', '');
                                                }}
                                                className="p-1 hover:bg-blue-100 text-blue-600 rounded-lg"
                                                title="Remove document"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="space-y-1.5">
                                            {/* Direct PDF / Document File Upload */}
                                            <label
                                              className={`border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/80 p-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                                uploadingFiles[`${modIdx}_${lesIdx}_document`]
                                                  ? 'opacity-60 cursor-not-allowed'
                                                  : ''
                                              }`}
                                            >
                                              <Upload className="w-4 h-4 text-blue-600 shrink-0" />
                                              <span className="text-xs font-semibold text-blue-800">
                                                {uploadingFiles[`${modIdx}_${lesIdx}_document`]
                                                  ? 'Uploading Document / PDF...'
                                                  : 'Upload PDF / Document (.pdf, .doc, .ppt up to 100MB)'}
                                              </span>
                                              <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,application/pdf"
                                                className="hidden"
                                                disabled={uploadingFiles[`${modIdx}_${lesIdx}_document`]}
                                                onChange={(e) =>
                                                  handleFileUpload(e, modIdx, lesIdx, 'document')
                                                }
                                              />
                                            </label>

                                            {/* Link and Name Fallback */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                              <input
                                                type="text"
                                                placeholder="Or paste Document / PDF URL"
                                                value={les.documentUrl || les.resourcePdfUrl || ''}
                                                onChange={(e) => {
                                                  handleLessonChange(modIdx, lesIdx, 'documentUrl', e.target.value);
                                                  handleLessonChange(modIdx, lesIdx, 'resourcePdfUrl', e.target.value);
                                                }}
                                                className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-mono"
                                              />
                                              <input
                                                type="text"
                                                placeholder="Document Name (e.g. CheatSheet.pdf)"
                                                value={les.documentName || ''}
                                                onChange={(e) =>
                                                  handleLessonChange(modIdx, lesIdx, 'documentName', e.target.value)
                                                }
                                                className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px]"
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <input
                                          type="number"
                                          min="5"
                                          max="180"
                                          placeholder="Duration (mins)"
                                          value={les.durationMinutes || 20}
                                          onChange={(e) =>
                                            handleLessonChange(
                                              modIdx,
                                              lesIdx,
                                              'durationMinutes',
                                              Number(e.target.value) || 20
                                            )
                                          }
                                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Guidance Notes */}
                              <div>
                                <textarea
                                  rows="2"
                                  placeholder="Lecture guidance, key takeaways, and hands-on instructions..."
                                  value={les.content || ''}
                                  onChange={(e) =>
                                    handleLessonChange(modIdx, lesIdx, 'content', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                                ></textarea>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalTab('info')}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('evaluations')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Continue to Evaluations</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EVALUATIONS (MIN 30 QUESTIONS) */}
          {modalTab === 'evaluations' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Question requirement counter & quick generate banner */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-bold text-xs text-slate-900">
                      Mid-Term & Final Evaluation Questions
                    </span>
                    {midtermQuestions.length + finalQuestions.length >= 30 ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {midtermQuestions.length + finalQuestions.length} Questions (≥ 30 requirement met)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        {midtermQuestions.length + finalQuestions.length} / 30 required (Need{' '}
                        {30 - (midtermQuestions.length + finalQuestions.length)} more)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    A minimum of 30 questions is required. Mid-Term questions evaluate first-half comprehension (≥60% unlocks second half). Final questions evaluate complete course mastery.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoGenerateQuestions}
                  className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ Auto-Generate 30 Questions</span>
                </button>
              </div>

              {/* Sub-tabs for Mid-term vs Final */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveEvalTab('midterm')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeEvalTab === 'midterm'
                        ? 'bg-amber-100 text-amber-900 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mid-Term Evaluation ({midtermQuestions.length} Qs)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveEvalTab('final')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeEvalTab === 'final'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Final Evaluation ({finalQuestions.length} Qs)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddQuestion(activeEvalTab)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Question
                </button>
              </div>

              {/* Notice regarding the active evaluation */}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                  activeEvalTab === 'midterm'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                {activeEvalTab === 'midterm' ? (
                  <span>
                    <strong>⚡ Mid-Term Evaluation Gate:</strong> Learners are tested after completing the first half of modules. A score of <strong>at least 60%</strong> is required to unlock the second half of the course curriculum.
                  </span>
                ) : (
                  <span>
                    <strong>🎓 Final Mastery Evaluation:</strong> Administered when the student completes 100% of all lessons to evaluate composite skill performance and grant the verified Skill Card.
                  </span>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {(activeEvalTab === 'midterm' ? midtermQuestions : finalQuestions).map((q, qIdx) => (
                  <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Question text..."
                          value={q.questionText}
                          onChange={(e) =>
                            handleQuestionChange(activeEvalTab, qIdx, 'questionText', e.target.value)
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(activeEvalTab, qIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 4 Choices */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctOptionIndex === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-colors ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSetCorrectOption(activeEvalTab, qIdx, optIdx)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                              title={isCorrect ? 'Correct Answer' : 'Click to set as correct answer'}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </button>
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(activeEvalTab, qIdx, optIdx, e.target.value)
                              }
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="w-full bg-transparent text-xs focus:outline-none"
                            />
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-700 font-bold shrink-0 uppercase tracking-wider">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalTab('modules')}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ← Back to Modules
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion(activeEvalTab)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question to {activeEvalTab === 'midterm' ? 'Mid-Term' : 'Final'}
                </button>
              </div>
            </div>
          )}

          {/* Modal Bottom Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              {creating ? (
                <span>Publishing Course...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Peer Course</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
