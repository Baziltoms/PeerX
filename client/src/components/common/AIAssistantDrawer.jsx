import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';

export const AIAssistantDrawer = ({ isOpen: controlledIsOpen, setIsOpen: controlledSetIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (controlledSetIsOpen) {
      controlledSetIsOpen(false);
    } else {
      setInternalIsOpen(false);
    }
  };

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your PeerX College Assistant. I can check your real-time attendance %, today’s schedule, pending assignment deadlines, and college notices grounded in live campus databases. How can I help you today?',
      groundedIn: 'PeerX Campus Knowledge Base',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: textToSend });
      const aiMsg = {
        sender: 'ai',
        text: res.data.reply,
        groundedIn: res.data.groundedIn,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Sorry, I could not process your query: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Attendance %',
    'Today’s Classes',
    'Pending Assignments',
    'Latest Notices',
  ];

  if (!isOpen) return null;

  return (
    <div
      id="ai-assistant-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-start animate-fade-in-up no-print print:hidden"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-md h-full shadow-2xl flex flex-col transform transition-all border-r border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between border-b border-indigo-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                PeerX Campus AI <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">v1.0</span>
              </h3>
              <p className="text-[10px] text-indigo-100 font-medium">Grounded in live portal & academic records</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompt Pills */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs no-scrollbar">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qp)}
              className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-all shadow-2xs"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[82%]">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  {m.text}
                </div>
                {m.groundedIn && (
                  <span className="block text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1 pl-1">
                    Grounded Source: {m.groundedIn}
                  </span>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Querying campus databases...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about attendance, schedule, notices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
