import React, { useState, useEffect } from 'react';
import { Star, Sparkles, MessageSquare, X, Send, CheckCircle2, ThumbsUp, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const RATING_LABELS = {
  5: { text: 'Outstanding! Loved it', emoji: '🌟', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  4: { text: 'Very Good & Helpful', emoji: '👍', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' },
  3: { text: 'Good / Satisfactory', emoji: '👌', badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  2: { text: 'Needs Improvement', emoji: '⚠️', badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
  1: { text: 'Poor / Disappointing', emoji: '👎', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
};

export const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Rate Your Experience',
  subtitle = 'How was your experience? Your feedback helps us continually improve.',
  featureBadge = 'Project Feedback',
  initialRating = 5,
  initialSuggestions = '',
  placeholder = 'What did you like? Any suggestions or improvements you would like to recommend?',
  quickSuggestions = ['⚡ Fast & Responsive', '🎨 Beautiful Design', '📚 Clear & Informative', '🚀 Easy to Navigate'],
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setHoverRating(0);
      setSuggestions(initialSuggestions);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialRating, initialSuggestions]);

  if (!isOpen) return null;

  const currentEffectiveRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[currentEffectiveRating] || RATING_LABELS[5];

  const handleQuickTagClick = (tag) => {
    setSuggestions((prev) => {
      const cleanTag = tag.replace(/^[^\w\s]+\s*/, ''); // remove leading emoji
      if (!prev.trim()) return cleanTag;
      if (prev.includes(cleanTag)) return prev;
      return `${prev.trim()}, ${cleanTag}`;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 5) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#6366F1', '#EC4899', '#10B981'],
        });
      } catch (err) {
        // ignore if confetti fails
      }
    }
    onSubmit({ rating, suggestions: suggestions.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-200 no-print print:hidden">
      <div
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-purple-500/10 dark:from-amber-500/20 dark:via-indigo-500/10 dark:to-purple-500/20 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-amber-100 dark:ring-amber-950/50">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 mb-1">
                <Heart className="w-3 h-3 text-amber-600 fill-amber-500" />
                {featureBadge}
              </div>
              <h3 className="font-heading font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                {title}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating Section */}
          <div className="text-center py-2 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Your Rating (1 to 5 Stars)
            </label>

            {/* 5 Big Interactive Stars */}
            <div
              className="flex items-center justify-center gap-2 sm:gap-3 py-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentEffectiveRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95 duration-150 rounded-xl"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150 ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.45)]'
                          : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Interactive Rating Badge & Text */}
            <div className="mt-2.5 flex items-center justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 ${ratingInfo.badge}`}
              >
                <span>{ratingInfo.emoji}</span>
                <span>{currentEffectiveRating}.0 of 5.0 Stars</span>
                <span className="opacity-80">— {ratingInfo.text}</span>
              </span>
            </div>
          </div>

          {/* Suggestions Text Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="feedback-suggestions"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Any Suggestions or Thoughts?
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>

            <textarea
              id="feedback-suggestions"
              rows={3}
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder={placeholder}
              className="w-full text-xs rounded-xl p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none shadow-inner"
            />

            {/* Quick Suggestions Chips */}
            {quickSuggestions && quickSuggestions.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick feedback tags (click to add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition-all hover:scale-105 active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors order-2 sm:order-1"
            >
              Maybe Later
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:via-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Feedback...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Rating & Suggestions
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
