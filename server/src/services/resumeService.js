import {
  Resume,
  ResumeGeneration,
  StudentProfile,
  User,
  Achievement,
  Department,
  Institution,
} from '../models/index.js';

export const checkResumeEligibility = async (studentId) => {
  const latestGen = await ResumeGeneration.findOne({ student: studentId }).sort({ generatedAt: -1 });

  return {
    canGenerate: true,
    lastGeneratedAt: latestGen ? latestGen.generatedAt : null,
    nextEligibleAt: null,
    remainingTimeFormatted: 'Eligible now',
  };
};

export const compileStudentResumeData = async (studentId) => {
  const user = await User.findById(studentId);
  const profile = await StudentProfile.findOne({ user: studentId })
    .populate('department', 'name code')
    .populate('institution', 'name code address');

  const achievements = await Achievement.find({ student: studentId }).populate('skillExchange', 'skillName skillLevel');

  // Build education history
  const institutionName = profile?.institution?.name || 'sngce';
  const education = [
    {
      degree: profile?.course || 'Master of Computer Applications (MCA)',
      institution: institutionName,
      score: `CGPA: ${profile?.cgpa || '8.5'} / 10`,
      year: `${profile?.batch || '2024-2026'} (Graduating ${profile?.graduationYear || '2026'})`,
    },
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'University of Technology',
      score: 'Percentage: 84.5%',
      year: '2021-2024',
    },
  ];

  // Group skills
  const categorizedSkills = [
    {
      category: 'Core Programming & Web',
      items: (profile?.skills || []).map((s) => s.name),
    },
    {
      category: 'PeerX Verified Skills',
      items: achievements.map((a) => `${a.skillName} (${a.badgeType} Badge - ${a.scoreAchieved}%)`),
    },
  ];

  return {
    studentId,
    contactInfo: {
      fullName: user.name,
      email: user.email,
      phone: user.phone || '+91 98765 43210',
      location: profile?.institution?.address?.city || 'Bengaluru, India',
      linkedin: profile?.linkedin || `https://linkedin.com/in/${user.name.toLowerCase().replace(/\s+/g, '-')}`,
      github: profile?.github || `https://github.com/${user.name.toLowerCase().replace(/\s+/g, '')}`,
      portfolio: profile?.portfolio || '',
    },
    headline: `${profile?.course || 'MCA'} Candidate | Software Engineering & Full-Stack Systems`,
    summary:
      profile?.bio ||
      `Motivated ${profile?.course || 'MCA'} student with a strong foundation in data structures, web architectures, and full-stack software development. Proven peer mentoring capability with verified skill badges in peer-to-peer engineering workshops.`,
    education,
    skills: categorizedSkills,
    peerAchievements: achievements.map((a) => ({
      skillName: a.skillName,
      level: a.skillLevel,
      score: a.scoreAchieved,
      badgeType: a.badgeType,
      verificationCode: a.verificationCode,
    })),
    experience: [
      {
        role: 'Full Stack Developer Intern',
        company: 'NexTech Solutions',
        duration: 'June 2024 - Aug 2024',
        location: 'Bengaluru, India',
        description:
          'Assisted in building responsive React client components and integrated RESTful endpoints with Node.js/Express. Implemented caching layers and automated testing.',
      },
    ],
    projects: profile?.projects?.length
      ? profile.projects
      : [
        {
          title: 'PeerX - Academic Management & Peer Learning Platform',
          description:
            'Architected a full-stack platform featuring role-based portals, sequential peer skill modules, strict attendance verification, and recruitment talent matchmaking.',
          techStack: ['Node.js', 'Express', 'React', 'MongoDB', 'JWT', 'Tailwind CSS'],
          link: 'https://github.com/sngce/peerx',
        },
        {
          title: 'Distributed File Indexer & Query Engine',
          description:
            'Built an inverted index search utility with multi-threaded tokenization and ranking metrics.',
          techStack: ['Java', 'Spring Boot', 'Elasticsearch'],
          link: '',
        },
      ],
    certifications: profile?.certifications?.length
      ? profile.certifications
      : [
        {
          title: 'Full-Stack Web Development Specialization',
          issuer: 'University Learning Network',
          year: '2025',
        },
      ],
  };
};

export const updateStudentResume = async (studentId, updatePayload = {}) => {
  let resume = await Resume.findOne({ student: studentId });
  if (!resume) {
    const compiled = await compileStudentResumeData(studentId);
    resume = new Resume({
      student: studentId,
      ...compiled,
    });
  }

  const allowedFields = [
    'headline',
    'summary',
    'contactInfo',
    'education',
    'skills',
    'peerAchievements',
    'experience',
    'projects',
    'certifications',
    'templateId',
  ];

  for (const field of allowedFields) {
    if (updatePayload[field] !== undefined) {
      resume[field] = updatePayload[field];
    }
  }

  await resume.save();
  return resume;
};

export const resetStudentResume = async (studentId) => {
  const compiled = await compileStudentResumeData(studentId);
  let resume = await Resume.findOne({ student: studentId });
  if (!resume) {
    resume = new Resume({ student: studentId });
  }

  resume.headline = compiled.headline;
  resume.summary = compiled.summary;
  resume.contactInfo = compiled.contactInfo;
  resume.education = compiled.education;
  resume.skills = compiled.skills;
  resume.peerAchievements = compiled.peerAchievements;
  resume.experience = compiled.experience;
  resume.projects = compiled.projects;
  resume.certifications = compiled.certifications;
  await resume.save();
  return resume;
};

export const generateStudentResume = async (
  studentId,
  templateId = 'modern_tech',
  ipAddress = '',
  customData = null
) => {
  let resume = await Resume.findOne({ student: studentId });

  if (customData) {
    if (!resume) {
      resume = new Resume({ student: studentId });
    }
    resume.templateId = templateId || customData.templateId || resume.templateId || 'modern_tech';
    if (customData.headline !== undefined) resume.headline = customData.headline;
    if (customData.summary !== undefined) resume.summary = customData.summary;
    if (customData.contactInfo !== undefined) resume.contactInfo = customData.contactInfo;
    if (customData.education !== undefined) resume.education = customData.education;
    if (customData.skills !== undefined) resume.skills = customData.skills;
    if (customData.peerAchievements !== undefined) resume.peerAchievements = customData.peerAchievements;
    if (customData.experience !== undefined) resume.experience = customData.experience;
    if (customData.projects !== undefined) resume.projects = customData.projects;
    if (customData.certifications !== undefined) resume.certifications = customData.certifications;
  } else if (resume) {
    // Preserve existing customized fields, only update templateId
    if (templateId) {
      resume.templateId = templateId;
    }
  } else {
    // 1. Compile structured data
    const resumeData = await compileStudentResumeData(studentId);
    resume = new Resume({ student: studentId });
    resume.templateId = templateId;
    resume.headline = resumeData.headline;
    resume.summary = resumeData.summary;
    resume.contactInfo = resumeData.contactInfo;
    resume.education = resumeData.education;
    resume.skills = resumeData.skills;
    resume.peerAchievements = resumeData.peerAchievements;
    resume.experience = resumeData.experience;
    resume.projects = resumeData.projects;
    resume.certifications = resumeData.certifications;
  }

  resume.lastGeneratedAt = new Date();
  await resume.save();

  // 3. Log generation event
  const now = new Date();

  await ResumeGeneration.create({
    student: studentId,
    generatedAt: now,
    nextEligibleAt: now,
    templateUsed: templateId || resume.templateId,
    ipAddress,
  });

  return {
    resume,
    nextEligibleAt: null,
    remainingTimeFormatted: 'Eligible now',
  };
};
