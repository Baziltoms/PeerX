import React, { useState, useEffect } from 'react';
import {
  Printer,
  Sparkles,
  Award,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link2,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Code,
  Terminal,
  LayoutTemplate,
  ShieldCheck,
  FileText,
  Star,
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/EmptyState.jsx';
import { FeedbackModal } from '../../components/common/FeedbackModal.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * 1. Modern Tech Resume Template
 * Sleek developer aesthetic with tech pills, badge mastery, and indigo highlights.
 */
const ModernTechResume = ({ resumeData, user }) => {
  const contact = resumeData?.contactInfo;
  const fullName = contact?.fullName || user?.name || 'Student Name';
  const headline = resumeData?.headline || 'Software Engineering & Full-Stack Systems';
  const summary = resumeData?.summary || '';
  const education = resumeData?.education || [];
  const peerAchievements = resumeData?.peerAchievements || [];
  const skills = resumeData?.skills || [];
  const projects = resumeData?.projects || [];
  const certifications = resumeData?.certifications || [];

  return (
    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto print-shadow-none text-slate-800 space-y-6 font-sans relative overflow-hidden transition-all duration-300 print:p-0 print:m-0 print:max-w-none print:border-none print:shadow-none print:rounded-none print:space-y-4 print:w-full">
      {/* Top Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full mb-2 print:hidden" />

      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
          {fullName}
        </h1>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Terminal className="w-3 h-3 text-indigo-600" />
            {headline}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-3">
          {contact?.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> {contact.email}
            </span>
          )}
          {contact?.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> {contact.phone}
            </span>
          )}
          {contact?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> {contact.location}
            </span>
          )}
          {contact?.linkedin && (
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline"
            >
              <Link2 className="w-3 h-3" /> LinkedIn
            </a>
          )}
          {contact?.github && (
            <a
              href={contact.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline"
            >
              <Code className="w-3 h-3" /> GitHub
            </a>
          )}
          {contact?.portfolio && (
            <a
              href={contact.portfolio}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline"
            >
              <Globe className="w-3 h-3" /> Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Professional Summary
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Software Engineering Projects */}
      {projects.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-indigo-600" /> Software Engineering Projects
          </h3>
          <div className="space-y-3.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{proj.title}</span>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    )}
                  </div>
                  {proj.techStack?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {proj.techStack.map((tech, tidx) => (
                        <span
                          key={tidx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PeerX Verified Achievements (Special Section) */}
      {peerAchievements.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-2xl border border-indigo-100">
          <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-600" /> PeerX Verified Peer Mentoring & Skill Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {peerAchievements.map((ach, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-indigo-100 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{ach.skillName}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {ach.score}% Mastery
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                  <span>Badge: {ach.badgeType || 'Peer Mentor'}</span>
                  <span>Hash: {ach.verificationCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" /> Technical Proficiencies
          </h3>
          <div className="space-y-2">
            {skills.map((grp, idx) => (
              <div key={idx} className="text-xs flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-800 min-w-28">{grp.category}:</span>
                <div className="flex flex-wrap gap-1">
                  {(grp.items || []).map((item, iidx) => (
                    <span
                      key={iidx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education History */}
      {education.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Education
          </h3>
          <div className="space-y-2.5">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                  <p className="text-slate-500">{edu.institution}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {edu.score}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Certifications & Credentials
          </h3>
          <div className="space-y-1.5 text-xs text-slate-700">
            {certifications.map((c, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  <strong>{c.title}</strong> — {c.issuer}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{c.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 2. Classic Academic Resume Template
 * Traditional university CV format with serif typography, centered formal header,
 * education emphasized first, and scholarly horizontal divider rules.
 */
const ClassicAcademicResume = ({ resumeData, user }) => {
  const contact = resumeData?.contactInfo;
  const fullName = contact?.fullName || user?.name || 'Student Name';
  const headline = resumeData?.headline || 'Academic & Engineering Scholar';
  const summary = resumeData?.summary || '';
  const education = resumeData?.education || [];
  const peerAchievements = resumeData?.peerAchievements || [];
  const skills = resumeData?.skills || [];
  const projects = resumeData?.projects || [];
  const certifications = resumeData?.certifications || [];

  return (
    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-sm max-w-4xl mx-auto print-shadow-none text-slate-900 space-y-5 font-serif transition-all duration-300 print:p-0 print:m-0 print:max-w-none print:border-none print:shadow-none print:rounded-none print:space-y-4 print:w-full">
      {/* Formal Academic Centered Header */}
      <div className="text-center pb-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 uppercase tracking-widest">
          {fullName}
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-slate-700 mt-1">
          {headline}
        </p>

        {/* Centered Contact Strip */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2 font-serif">
          {contact?.email && <span>{contact.email}</span>}
          {contact?.phone && (
            <>
              <span>•</span>
              <span>{contact.phone}</span>
            </>
          )}
          {contact?.location && (
            <>
              <span>•</span>
              <span>{contact.location}</span>
            </>
          )}
          {contact?.linkedin && (
            <>
              <span>•</span>
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-slate-900 underline">
                LinkedIn
              </a>
            </>
          )}
          {contact?.github && (
            <>
              <span>•</span>
              <a href={contact.github} target="_blank" rel="noreferrer" className="text-slate-900 underline">
                GitHub
              </a>
            </>
          )}
          {contact?.portfolio && (
            <>
              <span>•</span>
              <a href={contact.portfolio} target="_blank" rel="noreferrer" className="text-slate-900 underline">
                Portfolio
              </a>
            </>
          )}
        </div>

        {/* Classic Solid Divider Rule */}
        <div className="border-b-2 border-slate-900 mt-3.5 mb-2" />
      </div>

      {/* 1. Education Section (Academic Priority: Education is Always First) */}
      {education.length > 0 && (
        <div>
          <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-1 mb-2.5">
            Education & Academic Background
          </h3>
          <div className="space-y-2.5">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs font-serif">
                <div>
                  <h4 className="font-bold text-slate-950">{edu.degree}</h4>
                  <p className="italic text-slate-700">{edu.institution}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-950">{edu.score}</span>
                  <p className="text-[11px] text-slate-600">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Professional & Academic Summary */}
      {summary && (
        <div>
          <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-1 mb-2">
            Academic & Professional Summary
          </h3>
          <p className="text-xs text-slate-800 leading-relaxed text-justify font-serif">{summary}</p>
        </div>
      )}

      {/* 3. Verified Academic Credentials & Peer Mentoring (PeerX) */}
      {peerAchievements.length > 0 && (
        <div>
          <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-1 mb-2.5">
            Peer Mentoring & Verified Academic Honors
          </h3>
          <div className="space-y-2 font-serif">
            {peerAchievements.map((ach, idx) => (
              <div key={idx} className="border-l-2 border-slate-800 pl-3 py-0.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <strong className="text-slate-950 font-bold">
                    Verified Peer Instructor — {ach.skillName} ({ach.badgeType || 'Honor Badge'})
                  </strong>
                  <span className="text-[11px] font-semibold text-slate-900">{ach.score}% Mastery</span>
                </div>
                <p className="text-[11px] text-slate-600 italic font-mono mt-0.5">
                  Institutional Cryptographic Verification: {ach.verificationCode}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Engineering & Academic Projects */}
      {projects.length > 0 && (
        <div>
          <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-1 mb-2.5">
            Software Engineering & Research Projects
          </h3>
          <div className="space-y-3 font-serif">
            {projects.map((proj, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-slate-950">
                    {proj.title}
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-slate-700 underline ml-1.5 font-normal">
                        [Link]
                      </a>
                    )}
                  </h4>
                </div>
                {proj.techStack?.length > 0 && (
                  <p className="italic text-[11px] text-slate-700 mt-0.5">
                    Technologies & Methodologies: {proj.techStack.join(', ')}
                  </p>
                )}
                <p className="text-slate-800 mt-1 leading-relaxed text-justify">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Technical Competencies */}
      {skills.length > 0 && (
        <div>
          <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-1 mb-2">
            Technical & Methodological Proficiencies
          </h3>
          <div className="space-y-1.5 font-serif text-xs">
            {skills.map((grp, idx) => (
              <div key={idx}>
                <span className="font-bold text-slate-950">{grp.category}: </span>
                <span className="text-slate-800">{(grp.items || []).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Certifications & Credentials */}
      {certifications.length > 0 && (
        <div>
          <h3 className="font-serif text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-900 pb-1 mb-2">
            Certifications & Academic Credentials
          </h3>
          <div className="space-y-1 text-xs font-serif text-slate-800">
            {certifications.map((c, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  <strong>{c.title}</strong> — {c.issuer}
                </span>
                <span className="text-slate-600">{c.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 3. Minimalist Corporate Resume Template
 * Executive 2-column split layout with crisp high-contrast styling and structured whitespace.
 */
const ExecutiveMinimalResume = ({ resumeData, user }) => {
  const contact = resumeData?.contactInfo;
  const fullName = contact?.fullName || user?.name || 'Student Name';
  const headline = resumeData?.headline || 'Technology Leader & Full Stack Architect';
  const summary = resumeData?.summary || '';
  const education = resumeData?.education || [];
  const peerAchievements = resumeData?.peerAchievements || [];
  const skills = resumeData?.skills || [];
  const projects = resumeData?.projects || [];
  const certifications = resumeData?.certifications || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto print-shadow-none text-slate-800 overflow-hidden font-sans flex flex-col md:flex-row print:flex-row transition-all duration-300 print:p-0 print:m-0 print:max-w-none print:border-none print:shadow-none print:rounded-none print:w-full">
      {/* Left Column / Sidebar (Contact, Education, Skills, Badges) */}
      <div className="w-full md:w-5/12 print:w-5/12 bg-slate-50/90 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 space-y-6 print:bg-slate-50 print:border-r print:p-6 print:space-y-5">
        {/* Contact Information */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-300 mb-2.5">
            Contact
          </h4>
          <div className="space-y-2 text-xs text-slate-600">
            {contact?.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{contact.location}</span>
              </div>
            )}
            {contact?.linkedin && (
              <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">
                  LinkedIn Profile
                </a>
              </div>
            )}
            {contact?.github && (
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <a href={contact.github} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">
                  GitHub Profile
                </a>
              </div>
            )}
            {contact?.portfolio && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <a href={contact.portfolio} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">
                  Portfolio
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-300 mb-2.5">
              Education
            </h4>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <h5 className="font-bold text-slate-900">{edu.degree}</h5>
                  <p className="text-slate-500">{edu.institution}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-600 mt-1">
                    <span className="font-semibold text-slate-800">{edu.score}</span>
                    <span>{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Competencies */}
        {skills.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-300 mb-2.5">
              Competencies
            </h4>
            <div className="space-y-2.5">
              {skills.map((grp, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-1">
                    {grp.category}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(grp.items || []).map((item, iidx) => (
                      <span
                        key={iidx}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PeerX Verified Badges */}
        {peerAchievements.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-300 mb-2.5">
              Verified Badges
            </h4>
            <div className="space-y-2">
              {peerAchievements.map((ach, idx) => (
                <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{ach.skillName}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {ach.score}%
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 mt-1 truncate">
                    ID: {ach.verificationCode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-300 mb-2.5">
              Credentials
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {certifications.map((c, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-slate-800">{c.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {c.issuer} • {c.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column / Main Body (Executive Header, Summary, Projects) */}
      <div className="w-full md:w-7/12 print:w-7/12 p-6 sm:p-8 space-y-6 print:p-6 print:space-y-5">
        {/* Executive Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 uppercase tracking-tight">
            {fullName}
          </h1>
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mt-1">
            {headline}
          </p>
          <div className="border-b border-slate-200 mt-3" />
        </div>

        {/* Executive Profile Summary */}
        {summary && (
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">
              Executive Profile
            </h3>
            <div className="border-l-2 border-slate-900 pl-3.5 text-xs text-slate-700 leading-relaxed">
              {summary}
            </div>
          </div>
        )}

        {/* Key Projects & Technical Initiatives */}
        {projects.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest pb-1 mb-3.5 border-b border-slate-200">
              Key Projects & Technical Initiatives
            </h3>
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="text-xs space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {proj.title}
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 ml-1.5 font-normal text-xs"
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </h4>
                  </div>
                  {proj.techStack?.length > 0 && (
                    <p className="text-[11px] font-mono text-slate-500">
                      Stack: {proj.techStack.join(' • ')}
                    </p>
                  )}
                  <p className="text-slate-600 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Peer Mentorship & Technical Leadership Impact */}
        {peerAchievements.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest pb-1 mb-2.5 border-b border-slate-200">
              Peer Leadership & Mentorship
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Active peer mentor in the university engineering collective, guiding peers through rigorous technical modules with institutional credentialing and verifiable skill mastery hashes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResumeGenerator = () => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [template, setTemplate] = useState('modern_tech');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);

  const { showToast } = useToast();

  const fetchResumeData = async () => {
    try {
      const [eligRes, prevRes, feedbackRes] = await Promise.all([
        api.get('/resumes/eligibility'),
        api.get('/resumes/preview'),
        api.get('/resumes/feedback').catch(() => ({ data: [] })),
      ]);
      setEligibility(eligRes.data);
      setResumeData(prevRes.data);
      if (prevRes.data?.templateId) {
        setTemplate(prevRes.data.templateId);
      }
      if (feedbackRes?.data && feedbackRes.data.length > 0) {
        setLatestFeedback(feedbackRes.data[0]);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/resumes/generate', { templateId: template });
      showToast('Official resume snapshot generated successfully!', 'success');
      await fetchResumeData();
      // Popup feedback modal automatically after generating resume
      setTimeout(() => {
        setShowFeedbackModal(true);
      }, 500);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleFeedbackSubmit = async ({ rating, suggestions }) => {
    setSubmittingFeedback(true);
    try {
      const res = await api.post('/resumes/feedback', {
        rating,
        suggestions,
        templateId: template,
      });
      showToast(res.message || 'Thank you! Your feedback has been recorded.', 'success');
      setShowFeedbackModal(false);
      setLatestFeedback(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const studentName = resumeData?.contactInfo?.fullName || user?.name || 'Student';
    document.title = `${studentName.replace(/\s+/g, '_')}_Resume_PeerX`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (loading) return <div className="no-print print:hidden"><LoadingSkeleton count={3} /></div>;

  return (
    <div className="space-y-6 print:space-y-0 print:m-0 print:p-0 print:w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print print:hidden">
        <div>
          <h1 className="text-xl font-heading font-bold text-slate-900">Resume Generator</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compile your verified academic and peer badges into an official, verifiable resume.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Rate your experience and leave suggestions"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            {latestFeedback ? `Feedback (${latestFeedback.rating}★)` : 'Rate Resume'}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" /> Print / Save PDF
          </button>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {generating ? 'Compiling...' : 'Generate Official Snapshot'}
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print print:hidden">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Style Template:</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {template === 'modern_tech' && 'Modern Tech • Developer layout with skill tags & indigo accents'}
            {template === 'classic_academic' && 'Classic Academic • Traditional serif CV with education-first structure'}
            {template === 'executive_minimal' && 'Minimalist Corporate • 2-column executive split with high contrast'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'modern_tech', label: 'Modern Tech', icon: Terminal },
            { id: 'classic_academic', label: 'Classic Academic', icon: GraduationCap },
            { id: 'executive_minimal', label: 'Minimalist Corporate', icon: Briefcase },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Resume Document Canvas */}
      <div id="printable-resume" className="printable-resume print:m-0 print:p-0 print:w-full">
        {template === 'classic_academic' ? (
          <ClassicAcademicResume resumeData={resumeData} user={user} />
        ) : template === 'executive_minimal' ? (
          <ExecutiveMinimalResume resumeData={resumeData} user={user} />
        ) : (
          <ModernTechResume resumeData={resumeData} user={user} />
        )}
      </div>

      {/* Post-Generation Feedback Popup Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={submittingFeedback}
        title="PeerX Feedback"
        subtitle="You just compiled your verified resume! How was your experience? Rate and leave any suggestions to help us improve the platform."
        featureBadge="PeerX Feedback"
        initialRating={latestFeedback?.rating || 5}
        initialSuggestions={latestFeedback?.suggestions || ''}
        placeholder="What did you think of the template designs, speed, or layout? Any suggestions?"
        quickSuggestions={[
          '⚡ Super Fast Generation',
          '🎨 Modern Template Layouts',
          '📜 Accurate Academic Data',
          '⭐ Professional Design',
        ]}
      />
    </div>
  );
};
