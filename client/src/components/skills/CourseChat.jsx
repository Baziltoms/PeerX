import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Video,
  Copy,
  Check,
  ExternalLink,
  Users,
  Bell,
  Sparkles,
  Radio,
  Edit3,
  Clock,
  ShieldCheck,
  Crown,
  PhoneOff,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../common/Badge.jsx';
import { Modal } from '../common/Modal.jsx';

export const CourseChat = ({
  courseId,
  course,
  isTutor,
  onMeetingLinkUpdated,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [meetingLink, setMeetingLink] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit Meeting Link Modal State (Tutor only)
  const [isEditLinkOpen, setIsEditLinkOpen] = useState(false);
  const [customLinkInput, setCustomLinkInput] = useState('');
  const [updatingLink, setUpdatingLink] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const fetchChat = async (isInitial = false) => {
    try {
      const res = await api.get(`/skills/courses/${courseId}/chat`);
      if (res.data) {
        setChatData(res.data);
        setMessages(res.data.messages || []);
        setParticipants(res.data.participants || []);
        if (res.data.meetingLink) {
          setMeetingLink(res.data.meetingLink);
        }
      }
    } catch (err) {
      if (isInitial) {
        console.warn('Could not load course chat:', err.message);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchChat(true);

    // Poll every 4 seconds for real-time updates
    const interval = setInterval(() => {
      fetchChat(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [courseId]);

  useEffect(() => {
    // Smooth auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await api.post(`/skills/courses/${courseId}/chat/messages`, {
        content,
        isStudyRoomPing: false,
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      showToast(err.message, 'error');
      setNewMessage(content); // restore on error
    } finally {
      setSending(false);
      messageInputRef.current?.focus();
    }
  };

  const handleBroadcastStudyRoom = async () => {
    if (broadcasting) return;
    setBroadcasting(true);

    try {
      const res = await api.post(`/skills/courses/${courseId}/chat/messages`, {
        isStudyRoomPing: true,
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
      showToast('Study Room alert broadcasted! Course peers have been notified.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleCopyLink = () => {
    if (!meetingLink) return;
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    showToast('Study room meeting link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUpdateLinkSubmit = async (e) => {
    e.preventDefault();
    if (!customLinkInput.trim()) return;

    setUpdatingLink(true);
    try {
      const res = await api.patch(`/skills/courses/${courseId}/meeting-link`, {
        meetingLink: customLinkInput.trim(),
      });

      setMeetingLink(res.data.meetingLink);
      setIsEditLinkOpen(false);
      showToast('Study room meeting link updated successfully!', 'success');
      if (onMeetingLinkUpdated) {
        onMeetingLinkUpdated(res.data.meetingLink);
      }
      fetchChat(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingLink(false);
    }
  };

  const [endingSession, setEndingSession] = useState(false);

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
      handleBroadcastStudyRoom();
      const finalUrl = getMeetingUrlWithUserInfo(meetingLink);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      showToast(
        `Launching Study Room as Course Host (${user?.name || 'Tutor'}). Log in on Jitsi to start the conference!`,
        'success'
      );
    } else {
      const finalUrl = getMeetingUrlWithUserInfo(meetingLink);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      showToast(`Opening Study Room. Course Tutor (${course?.tutor?.name || 'Tutor'}) is the meeting host!`, 'info');
    }
  };

  const handleEndStudyRoom = async () => {
    if (endingSession) return;
    setEndingSession(true);
    try {
      const res = await api.post(`/skills/courses/${courseId}/chat/end-session`);
      if (res.data?.data) {
        if (res.data.data.message) {
          setMessages((prev) => [...prev, res.data.data.message]);
        }
        setChatData((prev) => ({
          ...prev,
          activeStudyRoom: { isActive: false },
        }));
      }
      showToast('Study Room session ended successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEndingSession(false);
    }
  };

  // Determine if a study room session is currently active
  const isStudyRoomActive = (() => {
    if (chatData?.activeStudyRoom !== undefined && typeof chatData.activeStudyRoom?.isActive === 'boolean') {
      return chatData.activeStudyRoom.isActive;
    }
    const latestStatus = [...messages].reverse().find(
      (m) => m.content?.includes('🎥') || m.content?.includes('🏁')
    );
    if (!latestStatus || latestStatus.content?.includes('🏁')) return false;
    return Date.now() - new Date(latestStatus.createdAt).getTime() < 30 * 60 * 1000;
  })();

  const waitingUser =
    chatData?.activeStudyRoom?.startedByName ||
    [...messages].reverse().find((m) => m.content?.includes('🎥'))?.sender?.name ||
    'A peer';

  const quickPrompts = [
    "🎥 I'm in the Study Room right now!",
    "👋 Ready for a live practice session?",
    "❓ Can someone review my exercise code?",
    "🚀 Starting the next sequential module!",
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
      {/* 1. Study Room Command Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-sm text-white">Live Peer Study Room</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Channel
                </span>
                {isTutor && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    You are Tutor
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl truncate">
                Collaborate via video conference or coordinate study sessions in this dedicated group chat.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Join / Start Study Room Video */}
            <button
              onClick={handleJoinMeeting}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 shrink-0 ${
                isTutor
                  ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-indigo-800 text-white shadow-indigo-600/30'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-indigo-600/30'
              }`}
            >
              {isTutor ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Start Meeting as Host</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Study Room</span>
                </>
              )}
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {/* End Session Button (when active) OR Broadcast Waiting Alert (when idle) */}
            {isStudyRoomActive ? (
              <button
                onClick={handleEndStudyRoom}
                disabled={endingSession}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                title="End active study room session for everyone"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>{endingSession ? 'Ending...' : 'End Session'}</span>
              </button>
            ) : (
              <button
                onClick={handleBroadcastStudyRoom}
                disabled={broadcasting}
                className="px-3 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                title="Broadcast to peers that you are waiting in the study room"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>{broadcasting ? 'Pinging...' : "I'm in Room"}</span>
              </button>
            )}

            {/* Tutor: Edit Meeting Link */}
            {isTutor && (
              <button
                onClick={() => {
                  setCustomLinkInput(meetingLink);
                  setIsEditLinkOpen(true);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors shrink-0"
                title="Change Meeting Link (e.g., Google Meet, Zoom)"
              >
                <Edit3 className="w-4 h-4 text-slate-300" />
              </button>
            )}
          </div>
        </div>

        {/* Live Active Presence Alert Banner with Direct Join and End Session Buttons */}
        {isStudyRoomActive && (
          <div className="mt-3 p-2.5 rounded-xl bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-semibold text-indigo-100">
                {waitingUser} is waiting in the Peer Study Room right now!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleJoinMeeting}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors shadow-xs"
              >
                <Video className="w-3 h-3" /> {isTutor ? 'Enter as Host' : 'Join Now'}
              </button>
              <button
                onClick={handleEndStudyRoom}
                disabled={endingSession}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                title="End study room session and clear waiting status"
              >
                <PhoneOff className="w-3 h-3" />
                <span>{endingSession ? 'Ending...' : 'End Session'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Info Sub-Bar: Participants & Link */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Group: <strong>{participants.length} Member{participants.length === 1 ? '' : 's'}</strong></span>
          </div>

          <div className="hidden sm:flex items-center -space-x-1.5">
            {participants.slice(0, 5).map((p) => (
              <img
                key={p._id}
                src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=4f46e5&color=fff`}
                alt={p.name}
                title={`${p.name} (${p.isTutor ? 'Peer Tutor' : 'Learner'})`}
                className="w-5 h-5 rounded-full ring-2 ring-white object-cover"
              />
            ))}
            {participants.length > 5 && (
              <div className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold text-slate-600 flex items-center justify-center ring-2 ring-white">
                +{participants.length - 5}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline truncate max-w-xs">
            {meetingLink}
          </span>
          <button
            onClick={handleCopyLink}
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Room Link'}</span>
          </button>
        </div>
      </div>

      {/* 3. Messages Stream */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs">Connecting to course discussion...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-700">Start the Course Discussion</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Say hello, ask peer mentor <strong>{course?.tutor?.name}</strong> questions, or broadcast that you are in the study room!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id?.toString() === user?._id?.toString();
            const isMsgTutor = msg.sender?._id?.toString() === course?.tutor?._id?.toString();
            const isStudyPing = msg.content?.includes('🎥');

            return (
              <div
                key={msg._id}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'P')}&background=4f46e5&color=fff`}
                    alt=""
                    className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5 border border-slate-200"
                  />
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 text-xs space-y-1 ${
                    isStudyPing
                      ? 'bg-gradient-to-r from-indigo-50 to-emerald-50 border border-emerald-300 text-slate-800 shadow-sm'
                      : isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-bold ${isMe ? 'text-indigo-100' : 'text-slate-900'}`}>
                      {isMe ? 'You' : msg.sender?.name || 'Peer'}
                    </span>

                    {isMsgTutor && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isMe
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        Peer Tutor
                      </span>
                    )}

                    <span
                      className={`text-[10px] ml-auto ${
                        isMe ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className={`whitespace-pre-wrap leading-relaxed ${isMe ? 'text-white' : 'text-slate-700'}`}>
                    {msg.content}
                  </p>

                  {/* Study Room Ping Join Action Card */}
                  {isStudyPing && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                        <Video className="w-3 h-3 text-emerald-600" /> Video Conference Ready
                      </span>
                      <button
                        onClick={handleJoinMeeting}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                      >
                        {isTutor ? 'Enter as Host' : 'Join Room'} <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>

                {isMe && (
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4f46e5&color=fff`}
                    alt=""
                    className="w-7 h-7 rounded-xl object-cover shrink-0 mt-0.5 border border-indigo-300"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Prompts Bar */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Quick:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setNewMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[11px] font-medium shrink-0 transition-colors border border-slate-200/60"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 5. Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={messageInputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message or question for the course group..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
          </button>
        </form>
      </div>

      {/* Modal: Tutor Edit Meeting Link */}
      {isTutor && (
        <Modal
          isOpen={isEditLinkOpen}
          onClose={() => setIsEditLinkOpen(false)}
          title="Update Study Room Meeting Link"
          size="md"
        >
          <form onSubmit={handleUpdateLinkSubmit} className="space-y-4 text-xs text-slate-700">
            <p className="text-slate-600 leading-relaxed">
              As the course tutor, you can set any video conferencing URL. You can use <strong>Jitsi Meet</strong>, <strong>Google Meet</strong> (<code>https://meet.google.com/xxx-xxxx-xxx</code>), or <strong>Zoom</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Room URL
              </label>
              <input
                type="url"
                required
                value={customLinkInput}
                onChange={(e) => setCustomLinkInput(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij or https://meet.jit.si/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Tip:</span>
              <p>Updating this link will automatically post an update notification in this discussion group for your enrolled learners.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditLinkOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingLink || !customLinkInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
              >
                {updatingLink ? 'Saving...' : 'Save Meeting Link'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
