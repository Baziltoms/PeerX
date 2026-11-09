import React, { useRef } from 'react';
import { Award, Download, Printer, ShieldCheck, Sparkles, CheckCircle2, Star } from 'lucide-react';

/**
 * SkillCard Component
 * Displays a verifiable digital achievement credential showing:
 * - Learner's Name
 * - Skill Name
 * - Assessed Level
 * - Verification Code, Tutor, Date, and Score
 * Provides instant Download as high-res PNG and Print options.
 */
export const SkillCard = ({
  learnerName = 'Student Learner',
  skillName = 'Skill Engineering',
  assessedLevel = 'Advanced Mastery',
  scoreAchieved = 90,
  courseTitle = 'Peer Skill Workshop',
  tutorName = 'Peer Tutor',
  verificationCode = 'PX-SKILL-123456',
  issuedDate = new Date().toLocaleDateString(),
  badgeType = 'Platinum',
}) => {
  const cardRef = useRef(null);

  /**
   * Generates a high-resolution PNG image on an HTML5 canvas
   * and triggers an immediate download.
   */
  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // 1. Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 700);
    bgGradient.addColorStop(0, '#0f172a'); // slate-900
    bgGradient.addColorStop(0.5, '#1e1b4b'); // indigo-950
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.roundRect ? ctx.roundRect(0, 0, 1200, 700, 32) : ctx.rect(0, 0, 1200, 700);
    ctx.fill();

    // 2. Decorative outer border with gradient
    const borderGradient = ctx.createLinearGradient(0, 0, 1200, 700);
    borderGradient.addColorStop(0, '#6366f1');
    borderGradient.addColorStop(0.5, '#f59e0b');
    borderGradient.addColorStop(1, '#8b5cf6');
    ctx.lineWidth = 6;
    ctx.strokeStyle = borderGradient;
    ctx.stroke();

    // 3. Inner card padding border
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.roundRect ? ctx.roundRect(24, 24, 1152, 652, 20) : ctx.rect(24, 24, 1152, 652);
    ctx.stroke();

    // 4. Header Bar
    ctx.fillStyle = '#818cf8'; // indigo-400
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('PEERX VERIFIED CREDENTIAL', 60, 80);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`CODE: ${verificationCode}`, 1140, 80);
    ctx.textAlign = 'left';

    // 5. Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('PEER SKILL MASTERY CARD', 60, 150);

    // 6. Subtitle
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '18px sans-serif';
    ctx.fillText('This official digital credential certifies assessed peer learning achievements of', 60, 195);

    // 7. Learner Name
    ctx.fillStyle = '#38bdf8'; // sky-400
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(learnerName, 60, 265);

    // 8. Skill & Assessed Level Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.roundRect ? ctx.roundRect(60, 310, 1080, 190, 16) : ctx.rect(60, 310, 1080, 190);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // Skill Field
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CORE SKILL', 90, 355);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(skillName, 90, 400);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Course: ${courseTitle}`, 90, 440);
    ctx.fillText(`Peer Tutor: ${tutorName}`, 90, 470);

    // Assessed Level Field (Right side of box)
    ctx.fillStyle = '#f59e0b'; // amber-500
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ASSESSED LEVEL', 1100, 355);

    ctx.fillStyle = '#fef08a'; // yellow-200
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(assessedLevel, 1100, 400);

    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Mastery Score: ${scoreAchieved}%`, 1100, 440);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Badge Tier: ${badgeType}`, 1100, 470);
    ctx.textAlign = 'left';

    // 9. Footer Info
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '16px sans-serif';
    ctx.fillText(`Issued: ${issuedDate}  •  Platform: PeerX Collegiate Skill Exchange  •  Status: Verified`, 60, 560);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '13px sans-serif';
    ctx.fillText(
      'Sequential module progression and multi-stage evaluations completed under peer mentoring protocol.',
      60,
      590
    );

    // 10. Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeSkill = skillName.replace(/\s+/g, '_');
    const safeName = learnerName.replace(/\s+/g, '_');
    link.download = `SkillCard_${safeSkill}_${safeName}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Skill Card Container */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-9 border-2 border-indigo-400/40 shadow-2xl shadow-indigo-950/40"
      >
        {/* Hologram / Ambient Light Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-extrabold shadow-md shadow-amber-500/20">
              <Award className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">
                PeerX Verified Credential
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white tracking-tight">
                Skill Mastery Card
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-slate-300">
              {verificationCode}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>
        </div>

        {/* Learner Info */}
        <div className="relative z-10 py-6 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Demonstrated and awarded to:</span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-sky-200">
            {learnerName}
          </h2>
          <p className="text-xs text-slate-400">
            For structured mastery, sequential module completion, and peer-evaluated competence.
          </p>
        </div>

        {/* Core Skill & Assessed Level Spec Box */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          {/* Left: Skill */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-300">
              Assessed Skill
            </span>
            <h4 className="text-xl font-heading font-bold text-white">{skillName}</h4>
            <p className="text-xs text-slate-400 line-clamp-1">{courseTitle}</p>
            <div className="text-[11px] text-slate-400 pt-1">
              Peer Tutor: <strong className="text-slate-200">{tutorName}</strong>
            </div>
          </div>

          {/* Right: Assessed Level & Score */}
          <div className="space-y-1.5 md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300">
              Assessed Level
            </span>
            <div className="flex md:justify-end items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 font-heading font-extrabold text-base">
                {assessedLevel}
              </span>
            </div>
            <div className="flex md:justify-end items-center gap-2 pt-1">
              <span className="text-xs text-emerald-400 font-bold">
                Mastery Score: {scoreAchieved}%
              </span>
              <span className="text-[10px] text-slate-400">({badgeType} Tier)</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 mt-5 border-t border-white/10 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Collegiate Peer-to-Peer Learning Exchange</span>
          </div>
          <div>
            <span>Issued: <strong>{issuedDate}</strong></span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Download Card & Print */}
      <div className="flex flex-wrap items-center gap-3 no-print">
        <button
          onClick={handleDownloadPNG}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" /> Download Skill Card (PNG)
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>
    </div>
  );
};
