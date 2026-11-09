import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  LogOut,
  Sparkles,
  Award,
  Lock,
  Eye,
  CameraOff,
  Radio,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProctoredExamModal = ({
  isOpen,
  onClose,
  evaluation,
  evaluationType = 'final',
  courseTitle = 'Skill Course',
  onSubmit,
  isSubmitting = false,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const containerRef = useRef(null);

  // Phases: 'BRIEFING' | 'ATTENDING' | 'TERMINATED' | 'COMPLETED'
  const [phase, setPhase] = useState('BRIEFING');
  const [agreedToRules, setAgreedToRules] = useState(false);

  // Question & Answers State
  const questions = evaluation?.questions || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60); // 1 minute per question

  // Malpractice & Security State
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationTime, setTerminationTime] = useState('');
  const [isScreenObscured, setIsScreenObscured] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [warningFlash, setWarningFlash] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Ref to access current state in event listeners
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const currentQIndexRef = useRef(currentQuestionIndex);
  currentQIndexRef.current = currentQuestionIndex;

  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Reset exam to start state when opened
  useEffect(() => {
    if (isOpen) {
      setPhase('BRIEFING');
      setAgreedToRules(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setQuestionTimeLeft(60);
      setTerminationReason('');
      setTerminationTime('');
      setIsScreenObscured(false);
      setShowExitConfirm(false);
      document.body.classList.add('proctored-exam-active');
    } else {
      document.body.classList.remove('proctored-exam-active');
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
    return () => {
      document.body.classList.remove('proctored-exam-active');
    };
  }, [isOpen]);

  // Request Fullscreen
  const enterFullscreen = async () => {
    try {
      const el = containerRef.current || document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      setIsFullscreenActive(true);
      return true;
    } catch (err) {
      console.warn('Fullscreen request bypassed or denied:', err);
      setIsFullscreenActive(true);
      return true;
    }
  };

  // Exit Fullscreen safely
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsFullscreenActive(false);
  };

  // Terminate Exam on Malpractice
  const triggerMalpracticeTermination = useCallback((reason) => {
    if (phaseRef.current !== 'ATTENDING') return;

    const timeString = new Date().toLocaleTimeString();
    setTerminationReason(reason);
    setTerminationTime(timeString);
    setIsScreenObscured(false);

    // Clear answers and reset question index as penalty
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuestionTimeLeft(60);

    setPhase('TERMINATED');
    exitFullscreen();

    showToast(`Exam Terminated: ${reason}. Restart from the beginning required.`, 'error');
  }, [showToast]);

  // Timer: 1 Minute (60 seconds) per question
  useEffect(() => {
    if (phase !== 'ATTENDING' || isSubmitting) return;

    const interval = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question
          handleTimeExpire();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentQuestionIndex, questions.length, isSubmitting]);

  // Handle timeout on current question
  const handleTimeExpire = () => {
    const nextIdx = currentQIndexRef.current + 1;
    if (nextIdx < questions.length) {
      showToast(
        `⏰ 1 minute expired for Question ${currentQIndexRef.current + 1}. Auto-advancing to Question ${nextIdx + 1}.`,
        'warning'
      );
      setCurrentQuestionIndex(nextIdx);
      setQuestionTimeLeft(60);
    } else {
      // Last question time expired -> Automatically end exam & submit!
      showToast('⏰ Exam time has expired! Automatically submitting your answers...', 'info');
      finalizeAndSubmit();
    }
  };

  // Finalize answers array and submit
  const finalizeAndSubmit = () => {
    const currentAnswers = answersRef.current;
    const answersArray = questions.map((_, i) =>
      currentAnswers[i] !== undefined ? currentAnswers[i] : -1
    );
    exitFullscreen();
    if (onSubmit) {
      onSubmit(answersArray);
    }
  };

  // Start Exam after Briefing
  const handleStartExam = async () => {
    if (!agreedToRules) {
      showToast('Please agree to the Academic Integrity & Proctoring Rules to proceed.', 'warning');
      return;
    }
    await enterFullscreen();
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuestionTimeLeft(60);
    setPhase('ATTENDING');
    showToast('Proctored Exam session started. Window focus is monitored.', 'success');
  };

  // Next Question Button handler
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionTimeLeft(60); // Fresh 1 minute for next question
    } else {
      // Final Question: manual submit
      finalizeAndSubmit();
    }
  };

  // Select option handler
  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // Restart after Termination
  const handleRestartExam = () => {
    setPhase('BRIEFING');
    setAgreedToRules(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuestionTimeLeft(60);
    setTerminationReason('');
    setTerminationTime('');
    setIsScreenObscured(false);
  };

  // Anti-Malpractice & Screenshot Protection Event Listeners
  useEffect(() => {
    if (phase !== 'ATTENDING') return;

    // 1. Window Blur (user clicks outside, switches application, minimizes, or opens screenshot tool)
    const handleWindowBlur = () => {
      setIsScreenObscured(true);
      triggerMalpracticeTermination('Window focus lost (switched window, application, or clicked off-screen)');
    };

    // 2. Tab Switch or Browser Minimized
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState !== 'visible') {
        setIsScreenObscured(true);
        triggerMalpracticeTermination('Tab switch or browser minimized detected');
      }
    };

    // 3. Exiting Fullscreen Mode
    const handleFullscreenChange = () => {
      const isStillFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (!isStillFullscreen && phaseRef.current === 'ATTENDING') {
        setIsScreenObscured(true);
        triggerMalpracticeTermination('Exited proctored full-screen environment');
      }
    };

    // 4. Keyboard Shortcuts: Screensnip, PrintScreen, Print, Copy, DevTools
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard?.writeText?.('').catch(() => {});
        setIsScreenObscured(true);
        triggerMalpracticeTermination('PrintScreen / Screenshot utility detected');
        return false;
      }

      // Windows Snipping Tool: Win+Shift+S / Meta+Shift+S / Ctrl+Shift+S / Alt+Shift+S
      if ((e.metaKey || e.ctrlKey || e.altKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        e.stopPropagation();
        setIsScreenObscured(true);
        triggerMalpracticeTermination('Screen snip shortcut detected (Shift+S)');
        return false;
      }

      // Mac Screenshot Shortcuts: Cmd + Shift + 3 / 4 / 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        setIsScreenObscured(true);
        triggerMalpracticeTermination('Mac screen capture shortcut detected');
        return false;
      }

      // Print: Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        setWarningFlash(true);
        setTimeout(() => setWarningFlash(false), 1200);
        showToast('Printing is strictly prohibited during the exam!', 'error');
        return false;
      }

      // Copy / Cut: Ctrl+C, Cmd+C, Ctrl+X, Cmd+X
      if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'x', 'X'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        setWarningFlash(true);
        setTimeout(() => setWarningFlash(false), 1200);
        showToast('Copying exam content is disabled for academic integrity.', 'warning');
        return false;
      }

      // Developer Tools / View Source: F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Opt+I/J/C
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['u', 'U'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setWarningFlash(true);
        setTimeout(() => setWarningFlash(false), 1200);
        showToast('Developer tools and inspect shortcuts are disabled.', 'error');
        return false;
      }

      // Prevent escape from exiting without confirmation
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowExitConfirm(true);
        return false;
      }
    };

    // 5. Context Menu & Selection Prevention
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleCopyCut = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCut);
    document.addEventListener('cut', handleCopyCut);
    document.addEventListener('selectstart', handleContextMenu);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCut);
      document.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('selectstart', handleContextMenu);
    };
  }, [phase, triggerMalpracticeTermination, showToast]);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isFinalQuestion = currentQuestionIndex === questions.length - 1;

  // Timer Colors & Ring Calculation
  const timerRadius = 26;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerOffset = timerCircumference - (questionTimeLeft / 60) * timerCircumference;
  const timerColor =
    questionTimeLeft > 20
      ? 'text-emerald-500 stroke-emerald-500'
      : questionTimeLeft > 10
      ? 'text-amber-500 stroke-amber-500'
      : 'text-red-500 stroke-red-500 animate-pulse';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-center items-center overflow-hidden proctored-exam-container select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Dynamic Academic Watermark across Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06] overflow-hidden select-none z-0 flex flex-wrap gap-12 p-8 leading-loose">
        {Array.from({ length: 40 }).map((_, idx) => (
          <div
            key={idx}
            className="rotate-[-25deg] text-[10px] font-mono font-bold tracking-widest text-white uppercase whitespace-nowrap"
          >
            PEERX SECURE PROCTOR • {user?.name || 'STUDENT'} • ID: {user?._id?.slice(-6) || 'STUDENT'} • MALPRACTICE MONITORED
          </div>
        ))}
      </div>

      {/* Screen Capture Blackout Shield */}
      {isScreenObscured && (
        <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500 mb-4 animate-bounce">
            <CameraOff className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-heading mb-2">Screen Content Protected</h2>
          <p className="text-sm text-slate-400 max-w-md">
            Screen captures, recording, or focus changes trigger instant obscuring to safeguard exam questions.
          </p>
        </div>
      )}

      {/* Warning Flash Border */}
      {warningFlash && (
        <div className="absolute inset-0 pointer-events-none border-4 border-red-500/80 z-50 animate-ping"></div>
      )}

      {/* ============================================================== */}
      {/* PHASE 1: BRIEFING & ACADEMIC INTEGRITY AGREEMENT */}
      {/* ============================================================== */}
      {phase === 'BRIEFING' && (
        <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 m-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Strict Proctored Assessment
                </span>
                <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900 dark:text-white mt-1">
                  {evaluation?.title || (evaluationType === 'mid_term' ? 'Mid-Term Evaluation' : 'Final Mastery Evaluation')}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Exam Details Badges */}
          <div className="grid grid-cols-3 gap-3 my-5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                Questions
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {questions.length} Items
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                Per Question
              </span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                1 Minute (60s)
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
                Passing Grade
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                ≥ {evaluation?.passingScore || 60}%
              </span>
            </div>
          </div>

          {/* Anti-Malpractice Rules */}
          <div className="space-y-3.5 mb-6">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Academic Malpractice & Security Protocols
            </h4>

            <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs text-red-950 dark:text-red-200 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-red-700 dark:text-red-400">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                Zero-Tolerance Window Switching & Minimize Policy:
              </div>
              <p>
                Switching browser tabs, opening any other window, minimizing, or clicking outside will{' '}
                <strong>instantly terminate this exam</strong>. If terminated, all answers are voided, and you must attend again from Question 1.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <CameraOff className="w-4 h-4 shrink-0" />
                Anti-Screenshot & Capture Shielding:
              </div>
              <p>
                Screenshots (PrtScn, Win+Shift+S, Cmd+Shift+3/4/5), screen recordings, clipboard copying, and printing are strictly blocked and monitored.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                <Clock className="w-4 h-4 shrink-0" />
                Strict 1-Minute Per Question Timer:
              </div>
              <p>
                Each question gives you <strong>1 minute (60 seconds)</strong>. When time runs out, the exam auto-advances. After the final question’s timer completes, the exam automatically ends and submits your answers.
              </p>
            </div>
          </div>

          {/* Student Acknowledgment Checkbox */}
          <label className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition-colors">
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              I certify that I am <strong>{user?.name || 'the student'}</strong>. I agree to enter Fullscreen Proctored Mode and acknowledge that changing or minimizing the window will terminate this exam attempt.
            </span>
          </label>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartExam}
              disabled={!agreedToRules}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all ${
                agreedToRules
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-600/25 cursor-pointer transform hover:scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              Start Proctored Exam (Enter Full-Screen)
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 2: ATTENDING THE EXAM (PROCTORED ACTIVE VIEW) */}
      {/* ============================================================== */}
      {phase === 'ATTENDING' && (
        <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col m-2 sm:m-4 max-h-[96vh] overflow-hidden">
          {/* Top Exam Navigation Bar */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Proctor Active</span>
              </div>
              <h3 className="text-xs sm:text-sm font-heading font-bold text-slate-200 truncate max-w-[200px] sm:max-w-md">
                {courseTitle} • {evaluation?.title || 'Evaluation'}
              </h3>
            </div>

            {/* Top Right: Countdown & Exit */}
            <div className="flex items-center gap-3">
              {/* Question 60-Second Timer Card */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-inner">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r={13}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      className="text-slate-700"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r={13}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 13}
                      strokeDashoffset={
                        2 * Math.PI * 13 - (questionTimeLeft / 60) * (2 * Math.PI * 13)
                      }
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ${
                        questionTimeLeft > 20
                          ? 'text-emerald-400'
                          : questionTimeLeft > 10
                          ? 'text-amber-400'
                          : 'text-red-500'
                      }`}
                    />
                  </svg>
                  <span
                    className={`absolute text-[10px] font-mono font-bold ${
                      questionTimeLeft <= 10 ? 'text-red-400 font-extrabold animate-pulse' : 'text-slate-200'
                    }`}
                  >
                    {questionTimeLeft}s
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Question Time</span>
                  <span className="text-xs font-mono font-bold text-white">
                    00:{questionTimeLeft < 10 ? `0${questionTimeLeft}` : questionTimeLeft}
                  </span>
                </div>
              </div>

              {/* Exit Exam Button */}
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                title="Cancel Exam"
                className="px-2.5 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>

          {/* Question Sequence Pills Tracker */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Progress:</span>
            {questions.map((_, qIdx) => {
              const isAnswered = answers[qIdx] !== undefined;
              const isCurrent = qIdx === currentQuestionIndex;
              return (
                <div
                  key={qIdx}
                  className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/50 scale-105'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isAnswered && !isCurrent ? '✓' : qIdx + 1}
                </div>
              );
            })}
          </div>

          {/* Active Question Content Area */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1">
            {currentQ ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {answeredCount} of {questions.length} Answered
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed select-none">
                    {currentQ.questionText}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {(currentQ.options || []).map((opt, optIdx) => {
                    const isSelected = answers[currentQuestionIndex] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-sm ring-1 ring-indigo-500'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-relaxed select-none">
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No questions configured for this examination.</p>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Auto-advances when timer reaches 0s. 1 minute per question.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all ${
                  isFinalQuestion
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {isSubmitting ? (
                  <span>Evaluating...</span>
                ) : isFinalQuestion ? (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Submit Final Evaluation
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 3: MALPRACTICE DETECTED & EXAM TERMINATED */}
      {/* ============================================================== */}
      {phase === 'TERMINATED' && (
        <div className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 border-2 border-red-500 rounded-3xl shadow-2xl p-6 sm:p-8 m-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 border-2 border-red-500 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 inline-block mb-2">
            Academic Integrity Violation
          </span>

          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white mb-2">
            Exam Terminated Due to Malpractice
          </h2>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            In accordance with exam proctoring rules, you cannot change windows, minimize the browser, or switch applications during the examination.
          </p>

          {/* Violation Details Box */}
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-left text-xs space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-800 dark:text-red-300">Detected Malpractice:</span>
              <span className="font-mono text-red-600 dark:text-red-400 font-bold">{terminationReason || 'Window focus lost / switch'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-800 dark:text-red-300">Logged Time:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">{terminationTime}</span>
            </div>
            <div className="pt-2 border-t border-red-200 dark:border-red-900/50 text-[11px] text-red-700 dark:text-red-300 font-medium">
              ⚠️ Penalty: Your current attempt has been cancelled, and all recorded answers were wiped. You must attend the examination again from the beginning (Question 1).
            </div>
          </div>

          {/* Restart from beginning button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestartExam}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              Restart Exam from Beginning
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Exit to Course
            </button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl space-y-4">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base">
              Exit Examination?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you exit now, your current answers will be discarded, and you will need to restart from Question 1 when taking the exam again.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Stay in Exam
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  exitFullscreen();
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
