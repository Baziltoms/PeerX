import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Unlock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Video,
  Award,
  ArrowLeft,
  Star,
  Printer,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Download,
  BookOpen,
  RotateCcw,
  Play,
  FileCheck,
  Radio,
  Users,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Badge } from '../../components/common/Badge.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { FeedbackModal } from '../../components/common/FeedbackModal.jsx';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { SkillCard } from '../../components/skills/SkillCard.jsx';
import { ProctoredExamModal } from '../../components/skills/ProctoredExamModal.jsx';
import { CourseChat } from '../../components/skills/CourseChat.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const YoutubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : null;
};

export const SkillCourseView = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Evaluations Modals state
  const [showMidpointModal, setShowMidpointModal] = useState(false);
  const [midpointAnswers, setMidpointAnswers] = useState({});
  const [midpointSubmitting, setMidpointSubmitting] = useState(false);

  const [showFinalModal, setShowFinalModal] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState({});
  const [finalSubmitting, setFinalSubmitting] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackReview, setFeedbackReview] = useState('');
  const [teachingClarity, setTeachingClarity] = useState(5);
  const [responsiveness, setResponsiveness] = useState(5);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Join Request State
  const [requestMessage, setRequestMessage] = useState('');
  const [requesting, setRequesting] = useState(false);

  // Tab & Study Room Chat State
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'chat' ? 'chat' : 'curriculum'
  );
  const [broadcastingWait, setBroadcastingWait] = useState(false);

  useEffect(() => {
    if (searchParams.get('tab') === 'chat') {
      setActiveTab('chat');
    }
  }, [searchParams]);

  const getMeetingUrlWithUserInfo = (rawUrl) => {
    if (!rawUrl) return 'https://meet.jit.si/PeerX-StudyRoom';
    if (rawUrl.includes('meet.jit.si')) {
      const base = rawUrl.split('#')[0];
      const hashParts = [];
      if (user?.name) hashParts.push(`userInfo.displayName=${encodeURIComponent(user.name)}`);
      if (user?.email) hashParts.push(`userInfo.email=${encodeURIComponent(user.email)}`);
      return hashParts.length > 0 ? `${base}#${hashParts.join('&')}` : base;
    }
    return rawUrl;
  };

  const handleJoinMeeting = () => {
    if (isTutor) {
      handleTopBarBroadcast();
      const finalUrl = getMeetingUrlWithUserInfo(course.meetingLink);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      showToast(
        `Launching Study Room as Course Host (${course.tutor?.name || user?.name}). Log in on Jitsi to start the conference!`,
        'success'
      );
    } else {
      const finalUrl = getMeetingUrlWithUserInfo(course.meetingLink);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      showToast(`Opening Study Room. Course Tutor (${course.tutor?.name || 'Tutor'}) is the meeting host!`, 'info');
    }
  };

  const handleTopBarBroadcast = async () => {
    if (broadcastingWait) return;
    setBroadcastingWait(true);
    try {
      await api.post(`/skills/courses/${courseId}/chat/messages`, {
        isStudyRoomPing: true,
      });
      showToast('Alert broadcasted! Course peers notified that you are in the Study Room.', 'success');
      setActiveTab('chat');
      setSearchParams({ tab: 'chat' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBroadcastingWait(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/skills/courses/${courseId}`);
      setCourseData(res.data);

      // Auto-select first unlocked lesson or synchronize active lesson
      if (selectedLesson) {
        const updated = res.data.modules
          ?.flatMap((m) => m.lessons)
          ?.find((l) => l._id === selectedLesson._id);
        if (updated) {
          setSelectedLesson(updated);
        } else {
          const firstUnlockedMod = res.data.modules?.find((m) => m.isUnlocked);
          if (firstUnlockedMod?.lessons?.length > 0) {
            setSelectedLesson(firstUnlockedMod.lessons[0]);
          }
        }
      } else {
        const firstUnlockedMod = res.data.modules?.find((m) => m.isUnlocked);
        if (firstUnlockedMod?.lessons?.length > 0) {
          setSelectedLesson(firstUnlockedMod.lessons[0]);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const handleLessonViewed = async (lessonId) => {
    try {
      await api.post(`/skills/courses/${courseId}/lessons/${lessonId}/view`);
      await fetchCourse();
      if (selectedLesson && selectedLesson._id === lessonId) {
        setSelectedLesson((prev) => ({ ...prev, isViewed: true }));
      }
    } catch (err) {
      console.warn('Could not record view:', err);
    }
  };

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    if (!lesson.isViewed) {
      handleLessonViewed(lesson._id);
    }
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      const res = await api.post(`/skills/courses/${courseId}/lessons/${lessonId}/complete`);
      showToast('Lesson completed! Curriculum progress updated.', 'success');
      await fetchCourse();
      if (selectedLesson && selectedLesson._id === lessonId) {
        setSelectedLesson((prev) => ({ ...prev, isCompleted: true, isViewed: true }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRequestJoin = async (e) => {
    e.preventDefault();
    setRequesting(true);
    try {
      await api.post(`/skills/courses/${courseId}/request-join`, { requestMessage });
      showToast('Join request submitted! The peer tutor will review your application.', 'success');
      await fetchCourse();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRequesting(false);
    }
  };

  const handleMidpointSubmit = async (answersFromExam) => {
    setMidpointSubmitting(true);

    try {
      const questions = courseData?.evaluations?.midpoint?.questions || [];
      const answersArray = Array.isArray(answersFromExam)
        ? answersFromExam
        : questions.map((_, i) => (midpointAnswers[i] !== undefined ? midpointAnswers[i] : -1));

      const res = await api.post(`/skills/courses/${courseId}/evaluation/mid_term`, {
        answers: answersArray,
      });

      const data = res.data?.data || res.data;
      if (data?.passed) {
        showToast(
          data.message || `Mid-Term Evaluation passed with ${data.score}%! The second half of the course is unlocked.`,
          'success'
        );
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        showToast(
          data.message || `Mid-Term score: ${data.score}%. A score of at least 60% is required to unlock the second half. You can retake this evaluation.`,
          'warning'
        );
      }

      setShowMidpointModal(false);
      await fetchCourse();
    } catch (err) {
      showToast(err.message || 'Mid-Term evaluation failed to submit', 'error');
    } finally {
      setMidpointSubmitting(false);
    }
  };

  const handleFinalSubmit = async (answersFromExam) => {
    setFinalSubmitting(true);

    try {
      const questions = courseData?.evaluations?.final?.questions || [];
      const answersArray = Array.isArray(answersFromExam)
        ? answersFromExam
        : questions.map((_, i) => (finalAnswers[i] !== undefined ? finalAnswers[i] : -1));

      const res = await api.post(`/skills/courses/${courseId}/evaluation/final`, {
        answers: answersArray,
      });

      if (res.data.data.passed) {
        showToast('Course passed! Verifiable Skill Card generated.', 'success');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        // Automatically pop up feedback modal after completing the course
        setTimeout(() => {
          setShowFeedbackModal(true);
        }, 1200);
      } else {
        showToast(res.data.message || 'Evaluation score below passing threshold.', 'info');
      }

      setShowFinalModal(false);
      await fetchCourse();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFinalSubmitting(false);
    }
  };

  const handleModalFeedbackSubmit = async ({ rating, suggestions }) => {
    setFeedbackSubmitting(true);
    try {
      await api.post(`/skills/courses/${courseId}/feedback`, {
        rating,
        review: suggestions,
        teachingClarity: rating,
        responsiveness: rating,
      });

      showToast('Thank you! Tutor feedback recorded and points awarded.', 'success');
      setShowFeedbackModal(false);
      await fetchCourse();
    } catch (err) {
      showToast(err.message || 'Failed to record feedback', 'error');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Auto-prompt feedback once per session if student completed the course and hasn't rated yet
  useEffect(() => {
    if (courseData?.enrollment?.status === 'completed' && !courseData?.hasFeedbackSubmitted) {
      const sessionKey = `peerx_feedback_prompt_${courseId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, '1');
        const timer = setTimeout(() => {
          setShowFeedbackModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [courseData?.enrollment?.status, courseData?.hasFeedbackSubmitted, courseId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);

    try {
      const res = await api.post(`/skills/courses/${courseId}/feedback`, {
        rating: feedbackRating,
        review: feedbackReview,
        teachingClarity,
        responsiveness,
      });

      showToast('Thank you! Tutor feedback recorded and points awarded.', 'success');
      await fetchCourse();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  const course = courseData?.course || {};
  const modules = courseData?.modules || [];
  const enrollment = courseData?.enrollment;
  const enrollmentStatus = courseData?.enrollmentStatus || 'none';
  const isAccepted = courseData?.isAccepted;
  const isTutor = courseData?.isTutor;
  const progressPct = courseData?.progressPercentage || 0;
  const isCompleted = enrollment?.status === 'completed';
  const midpointEval = courseData?.evaluations?.midpoint;
  const finalEval = courseData?.evaluations?.final;
  const hasFeedbackSubmitted = courseData?.hasFeedbackSubmitted;
  const userFeedback = courseData?.userFeedback;
  const allFeedbacks = courseData?.allFeedbacks || [];

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/student/skills"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Skill Courses
        </Link>

        {isAccepted && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Study Room Launch Button (Tutor as Host vs. Student) */}
            <button
              onClick={handleJoinMeeting}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 shadow-xs ${
                isTutor
                  ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-indigo-800 text-white shadow-indigo-600/20'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80'
              }`}
            >
              {isTutor ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" /> Start Meeting as Host
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5 text-indigo-600" /> Join Peer Study Room
                </>
              )}
            </button>

            {/* Broadcast: In Study Room Alert */}
            <button
              onClick={handleTopBarBroadcast}
              disabled={broadcastingWait}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Broadcast alert to peers that you are waiting in the study room"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{broadcastingWait ? 'Pinging...' : "I'm in Room"}</span>
            </button>

            {/* Mid-Term Assessment Button */}
            {midpointEval?.isEligible && !midpointEval.passed && (
              <button
                onClick={() => setShowMidpointModal(true)}
                className={`px-3.5 py-1.5 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all ${
                  midpointEval.completedAt
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 animate-pulse'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                {midpointEval.completedAt
                  ? `Retake Mid-Term (${midpointEval.score}%)`
                  : 'Take Mid-Term Evaluation'}
              </button>
            )}

            {/* Final Assessment Button (available at 100% + midpoint passed) */}
            {finalEval?.isEligible && !isCompleted && (
              <button
                onClick={() => setShowFinalModal(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 animate-bounce"
              >
                <Sparkles className="w-4 h-4" /> Take Final Evaluation
              </button>
            )}

            {/* Rate Course / Feedback Button for Completed Learners */}
            {isCompleted && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                title="Rate Course & Tutor"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                {hasFeedbackSubmitted ? `Feedback (${userFeedback?.rating || 5}★)` : 'Rate Course'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Access Control Notice: Pending or Unenrolled */}
      {!isAccepted && (
        <div className="rounded-3xl p-6 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-amber-50/70 border-amber-200 text-amber-900">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-amber-900">
                {enrollmentStatus === 'pending'
                  ? 'Join Request Pending Tutor Review'
                  : enrollmentStatus === 'rejected'
                  ? 'Join Request Declined by Tutor'
                  : 'Enrollment Required for Full Curriculum'}
              </h3>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                {enrollmentStatus === 'pending'
                  ? `Your join request is currently under review by peer tutor ${course.tutor?.name}. Once accepted, Module 1 lessons, videos, and study resources will be automatically unlocked for you.`
                  : enrollmentStatus === 'rejected'
                  ? 'The peer tutor has declined your previous join request. You may re-submit a request with updated learning goals below.'
                  : `This course requires tutor approval to maintain balanced study groups. Request to join this course to learn directly from peer mentor ${course.tutor?.name}.`}
              </p>
            </div>
          </div>

          {enrollmentStatus !== 'pending' && (
            <div className="w-full md:w-auto">
              <button
                onClick={handleRequestJoin}
                disabled={requesting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 w-full md:w-auto"
              >
                <Send className="w-3.5 h-3.5" />
                {requesting ? 'Submitting...' : 'Request to Join Course'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
              {course.skillName}
            </span>
            <Badge variant="neutral" size="sm" className="capitalize">{course.skillLevel}</Badge>
            <span className="text-xs text-slate-400">• Duration: {course.estimatedDuration}</span>
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {course.ratingAverage?.toFixed(1) || '5.0'} ({course.totalRatings || 0} reviews)
            </span>
          </div>

          <h1 className="text-xl font-heading font-bold text-slate-900 mb-2">{course.title}</h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{course.description}</p>

          <div className="flex items-center gap-2 mt-4 text-xs text-slate-600">
            <img
              src={course.tutor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.tutor?.name || 'T')}&background=4f46e5&color=fff`}
              alt=""
              className="w-6 h-6 rounded-lg object-cover"
            />
            <span>Peer Tutor: <strong>{course.tutor?.name}</strong></span>
          </div>
        </div>

        {/* Course Progress Card */}
        {isAccepted && (
          <div className="w-full md:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Curriculum Progress</span>
                <span className="text-indigo-600">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  style={{ width: `${progressPct}%` }}
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Mid-Term Evaluation:</span>
                <span
                  className={
                    midpointEval?.passed
                      ? 'text-emerald-600 font-bold'
                      : midpointEval?.completedAt
                      ? 'text-amber-600 font-bold'
                      : midpointEval?.isEligible
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {midpointEval?.passed
                    ? `Passed (${midpointEval.score}%)`
                    : midpointEval?.completedAt
                    ? `Retake Req. (${midpointEval.score}%)`
                    : midpointEval?.isEligible
                    ? 'Available (≥60% req.)'
                    : 'Unlocks after 1st half'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Final Evaluation:</span>
                <span className={isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {isCompleted ? `Passed (${enrollment.finalScore}%)` : 'Unlocks at 100%'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mid-Term Evaluation Progression Alert Banner */}
      {isAccepted && (
        <>
          {midpointEval?.completedAt && !midpointEval.passed ? (
            <div className="rounded-3xl p-5 border shadow-sm bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-amber-300 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900">
                      Mid-Term Evaluation Score: {midpointEval.score}% (Requires ≥ 60% to Unlock Second Half)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      Score Below 60%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    You scored <strong>{midpointEval.score}%</strong> on your previous attempt. The second half of the course curriculum remains locked. Review your first-half module notes and retake the evaluation anytime.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMidpointModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105"
              >
                <Award className="w-3.5 h-3.5" /> Retake Mid-Term Evaluation
              </button>
            </div>
          ) : midpointEval?.isEligible && !midpointEval.passed ? (
            <div className="rounded-3xl p-5 border shadow-sm bg-gradient-to-r from-amber-50 via-amber-50/50 to-indigo-50/50 border-amber-200 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 animate-bounce">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-slate-900">
                      First Half Completed: Mid-Term Evaluation Ready
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Passing Grade ≥ 60%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    You have finished the foundational first half of the curriculum! You must score at least <strong>60%</strong> on this evaluation to unlock the advanced second half modules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMidpointModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105"
              >
                <Award className="w-3.5 h-3.5" /> Take Mid-Term Evaluation
              </button>
            </div>
          ) : midpointEval?.passed ? (
            <div className="rounded-2xl p-4 border bg-emerald-50/80 border-emerald-200 text-emerald-950 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900">
                    Mid-Term Evaluation Passed ({midpointEval.score}%)
                  </span>
                  <p className="text-[11px] text-emerald-700">
                    Second half curriculum unlocked! You may now proceed through the remaining advanced modules.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                Unlocked Second Half
              </span>
            </div>
          ) : null}
        </>
      )}

      {/* Primary Navigation Tabs: Curriculum vs. Study Room & Discussion */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setActiveTab('curriculum');
            setSearchParams({ tab: 'curriculum' });
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'curriculum'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum & Lessons</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('chat');
            setSearchParams({ tab: 'chat' });
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Study Room & Peer Discussion</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {activeTab === 'chat' ? (
        isAccepted ? (
          <CourseChat
            courseId={courseId}
            course={course}
            isTutor={isTutor}
            onMeetingLinkUpdated={(newLink) => {
              setCourseData((prev) => ({
                ...prev,
                course: { ...prev.course, meetingLink: newLink },
              }));
            }}
          />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-800">
              Enrolment Required for Study Room & Course Discussion
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              To participate in the live video study room and course group discussion with peer tutor {course.tutor?.name}, submit a request to join this course above.
            </p>
          </div>
        )
      ) : (
        /* Main Learning Hub: Sequential Modules & Lesson Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sequential Curriculum Modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900">Sequential Modules</h3>
            <span className="text-xs text-slate-400 font-medium">
              {courseData?.completedLessonsCount || 0} / {courseData?.totalLessons || 0} completed
            </span>
          </div>

          {modules.map((mod) => (
            <div
              key={mod._id}
              className={`rounded-2xl border transition-all ${
                mod.isUnlocked
                  ? 'bg-white border-slate-200 shadow-sm'
                  : mod.lockedReason === 'midterm_required'
                  ? 'bg-amber-50/40 border-amber-200/80 shadow-xs'
                  : 'bg-slate-100/70 border-slate-200/60 opacity-80'
              }`}
            >
              {/* Module Header */}
              <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      mod.isUnlocked
                        ? mod.isFullyCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                        : mod.lockedReason === 'midterm_required'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {mod.isUnlocked ? (
                      mod.isFullyCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-heading font-bold text-xs text-slate-900">{mod.title}</h4>
                      {mod.isSecondHalf && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                            mod.isUnlocked
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-amber-100/80 text-amber-800 border-amber-300'
                          }`}
                        >
                          2nd Half {mod.isUnlocked ? '• Unlocked' : '• Mid-Term Req.'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {mod.isUnlocked
                        ? `${mod.completedLessonsCount} / ${mod.totalLessons} lessons finished`
                        : mod.lockedReason === 'midterm_required'
                        ? 'Locked • Requires Mid-Term Score ≥ 60%'
                        : `Locked • Complete Module ${mod.orderIndex - 1} to unlock`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lessons List in Module */}
              {mod.isUnlocked ? (
                <div className="p-2 divide-y divide-slate-100">
                  {mod.lessons.map((les) => {
                    const isSelected = selectedLesson?._id === les._id;
                    return (
                      <button
                        key={les._id}
                        onClick={() => selectLesson(les)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {les.materialType === 'youtube' ? (
                            <YoutubeIcon className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          ) : les.materialType === 'video_recording' ? (
                            <Video className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          ) : les.materialType === 'document' ? (
                            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                          {les.durationMinutes > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {les.durationMinutes}m
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {les.isViewed && !les.isCompleted && (
                            <span className="text-[10px] text-indigo-600 font-medium px-1.5 py-0.5 rounded bg-indigo-50">
                              Viewed
                            </span>
                          )}
                          {les.isCompleted && (
                            <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.5 rounded bg-emerald-50">
                              Completed
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-slate-50/50 rounded-b-2xl border-t border-slate-100">
                  {mod.lockedReason === 'midterm_required' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Second Half Locked: Mid-Term Evaluation</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Score ≥ 60% on the Mid-Term Evaluation to unlock this module.
                      </p>
                      {midpointEval?.isEligible && (
                        <button
                          onClick={() => setShowMidpointModal(true)}
                          className="mt-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors"
                        >
                          <Award className="w-3 h-3" />
                          {midpointEval.completedAt && !midpointEval.passed
                            ? `Retake Mid-Term (Score: ${midpointEval.score}%)`
                            : 'Take Mid-Term Evaluation'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Sequential learning: finish earlier modules to unlock.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Active Lesson Player & Resource Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLesson && selectedLesson.content !== null ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active Lesson
                    </span>
                    {selectedLesson.materialType === 'youtube' ||
                    selectedLesson.youtubeUrl ||
                    (selectedLesson.videoUrl && selectedLesson.videoUrl.includes('youtu')) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <YoutubeIcon className="w-3 h-3 text-red-600" /> YouTube Video
                      </span>
                    ) : selectedLesson.materialType === 'video_recording' || selectedLesson.videoRecordingUrl ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Video className="w-3 h-3 text-purple-600" /> Video Recording
                      </span>
                    ) : selectedLesson.materialType === 'document' ||
                      selectedLesson.documentUrl ||
                      selectedLesson.resourcePdfUrl ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <FileText className="w-3 h-3 text-blue-600" /> Document / PDF
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <BookOpen className="w-3 h-3 text-emerald-600" /> Code Notes & Guide
                      </span>
                    )}

                    {selectedLesson.durationMinutes > 0 && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        • {selectedLesson.durationMinutes} mins
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-heading font-bold text-slate-900">{selectedLesson.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mark as Viewed */}
                  <button
                    onClick={() => handleLessonViewed(selectedLesson._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      selectedLesson.isViewed
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {selectedLesson.isViewed ? 'Viewed' : 'Mark as Viewed'}
                  </button>

                  {/* Mark as Completed */}
                  <button
                    onClick={() => handleLessonComplete(selectedLesson._id)}
                    disabled={selectedLesson.isCompleted}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      selectedLesson.isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedLesson.isCompleted ? 'Completed' : 'Mark as Completed'}
                  </button>
                </div>
              </div>

              {/* Rich Learning Material Player: YouTube Video */}
              {(selectedLesson.materialType === 'youtube' ||
                selectedLesson.youtubeUrl ||
                (selectedLesson.videoUrl && selectedLesson.videoUrl.includes('youtu'))) && (
                <div className="space-y-2">
                  {(() => {
                    const embedUrl = getYouTubeEmbedUrl(selectedLesson.youtubeUrl || selectedLesson.videoUrl);
                    if (embedUrl) {
                      return (
                        <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-md border border-slate-800">
                          <iframe
                            src={embedUrl}
                            title={selectedLesson.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center text-white p-6 relative">
                        <PlayCircle className="w-12 h-12 text-red-500 mb-2 animate-pulse" />
                        <p className="text-xs font-semibold text-slate-300 mb-3">YouTube Video Resource</p>
                        <a
                          href={selectedLesson.youtubeUrl || selectedLesson.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
                        >
                          <span>Watch on YouTube</span> <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <YoutubeIcon className="w-4 h-4 text-red-600" /> Embedded YouTube Lecture
                    </span>
                    <a
                      href={selectedLesson.youtubeUrl || selectedLesson.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      Open in YouTube <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Rich Learning Material Player: Video Recording */}
              {(selectedLesson.materialType === 'video_recording' ||
                (selectedLesson.videoRecordingUrl && selectedLesson.materialType !== 'youtube')) && (
                <div className="space-y-2">
                  <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-md border border-slate-800">
                    <video
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      src={selectedLesson.videoRecordingUrl || selectedLesson.videoUrl}
                      poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                    >
                      Your browser does not support HTML5 video streaming.
                    </video>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Video className="w-4 h-4 text-purple-600" /> Tutor Video Recording
                    </span>
                    <a
                      href={selectedLesson.videoRecordingUrl || selectedLesson.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      Open in Full View <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Rich Learning Material: Document / PDF Card */}
              {(selectedLesson.documentUrl || selectedLesson.resourcePdfUrl) && (
                <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-xs text-slate-900">
                          {selectedLesson.documentName || 'Course Reading Document / PDF'}
                        </h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          PDF / DOC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Official learning material and exercises uploaded by peer mentor {course.tutor?.name}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <a
                      href={selectedLesson.documentUrl || selectedLesson.resourcePdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Read
                    </a>
                    <a
                      href={selectedLesson.documentUrl || selectedLesson.resourcePdfUrl}
                      download={selectedLesson.documentName || 'peerx-material'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              )}

              {/* Lesson Text Content */}
              <div>
                <h4 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Lesson Guidance & Code Notes
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-2 border border-slate-100 whitespace-pre-line font-normal">
                  <p>{selectedLesson.content || 'Study the lecture video and hands-on examples provided by your peer mentor.'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-400">
              {isAccepted
                ? 'Select an unlocked lesson from the curriculum to view videos and resources.'
                : 'Locked: Course materials are restricted until your join request is accepted by the tutor.'}
            </div>
          )}

          {/* Verifiable Skill Card Section (Generated when course completed) */}
          {isCompleted && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Your Verified Skill Card
                  </h3>
                  <p className="text-xs text-slate-500">
                    Officially demonstrates your learning achievements and evaluated competency level.
                  </p>
                </div>
              </div>

              <SkillCard
                learnerName={user?.name || 'Learner'}
                skillName={course.skillName}
                assessedLevel={enrollment?.scoreBreakdown?.assessedLevel || 'Advanced Mastery'}
                scoreAchieved={enrollment?.finalScore || 90}
                courseTitle={course.title}
                tutorName={course.tutor?.name || 'Peer Tutor'}
                verificationCode={`PX-${course.skillName.substring(0, 3).toUpperCase()}-VERIFIED`}
                issuedDate={enrollment?.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              />
            </div>
          )}

          {/* Tutor Feedback Section (Only eligible completed learners can submit) */}
          {isCompleted && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" /> Peer Tutor Feedback
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recognise helpful teaching and suggest improvements for tutor {course.tutor?.name}.
                  </p>
                </div>
                {hasFeedbackSubmitted ? (
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3 h-3 inline mr-1" /> Feedback Recorded
                  </Badge>
                ) : (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Open Rating Popup
                  </button>
                )}
              </div>

              {hasFeedbackSubmitted ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= (userFeedback?.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {userFeedback?.rating || 5}.0 Stars
                    </span>
                  </div>
                  {userFeedback?.review && (
                    <p className="text-xs text-slate-600 italic">"{userFeedback.review}"</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    One feedback record allowed per completed enrolment. Recorded on{' '}
                    {new Date(userFeedback?.createdAt || Date.now()).toLocaleDateString()}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Overall Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFeedbackRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              s <= feedbackRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">{feedbackRating} of 5 Stars</span>
                    </div>
                  </div>

                  {/* Teaching Clarity & Responsiveness */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Teaching Clarity: <strong>{teachingClarity}/5</strong>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={teachingClarity}
                        onChange={(e) => setTeachingClarity(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mentor Responsiveness: <strong>{responsiveness}/5</strong>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={responsiveness}
                        onChange={(e) => setResponsiveness(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Written Review */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Written Review & Feedback</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Share what worked well and how your peer mentor helped your learning..."
                      value={feedbackReview}
                      onChange={(e) => setFeedbackReview(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {feedbackSubmitting ? 'Recording...' : 'Submit Tutor Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Midpoint Evaluation Proctored Modal */}
      <ProctoredExamModal
        isOpen={showMidpointModal}
        onClose={() => setShowMidpointModal(false)}
        evaluation={midpointEval}
        evaluationType="mid_term"
        courseTitle={courseData?.skillName || 'Skill Exchange Course'}
        onSubmit={handleMidpointSubmit}
        isSubmitting={midpointSubmitting}
      />

      {/* Final Evaluation Proctored Modal */}
      <ProctoredExamModal
        isOpen={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        evaluation={finalEval}
        evaluationType="final"
        courseTitle={courseData?.skillName || 'Skill Exchange Course'}
        onSubmit={handleFinalSubmit}
        isSubmitting={finalSubmitting}
      />

      {/* Course Completion Feedback Popup Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleModalFeedbackSubmit}
        isSubmitting={feedbackSubmitting}
        title="PeerX Feedback"
        subtitle={`Congratulations on completing the curriculum! Rate tutor ${course.tutor?.name || 'Peer Tutor'} and share suggestions to help us improve.`}
        featureBadge="PeerX Feedback"
        initialRating={userFeedback?.rating || 5}
        initialSuggestions={userFeedback?.review || ''}
        placeholder="How was the teaching style, lesson clarity, and overall course material? Share any suggestions..."
        quickSuggestions={[
          '🌟 Clear Explanations',
          '🤝 Super Helpful Tutor',
          '💡 Great Practical Examples',
          '⚡ Fast Response',
        ]}
      />
    </div>
  );
};
