import { StudentProfile, User, Achievement } from '../models/index.js';

export const calculateCandidateMatchScore = (candidateProfile, criteria = {}) => {
  const {
    requiredSkills = [],
    preferredSkills = [],
    minCgpa = 7.0,
    eligibleCourses = [],
    graduationYear = 2026,
    maxBacklogs = 0,
  } = criteria;

  const candidateSkills = (candidateProfile.skills || []).map((s) => s.name.toLowerCase().trim());
  const candidateProjects = candidateProfile.projects || [];
  const candidateCerts = candidateProfile.certifications || [];
  const candidateCgpa = candidateProfile.cgpa || 0;
  const candidateBacklogs = candidateProfile.backlogs || 0;
  const candidateCourse = (candidateProfile.course || '').toLowerCase();
  const candidateGradYear = candidateProfile.graduationYear || 2026;

  // 1. Required Skills Match (40% Weight)
  let matchedRequired = [];
  let missingRequired = [];
  let reqScore = 0;

  if (requiredSkills.length > 0) {
    requiredSkills.forEach((skill) => {
      const s = skill.toLowerCase().trim();
      if (candidateSkills.some((cs) => cs.includes(s) || s.includes(cs))) {
        matchedRequired.push(skill);
      } else {
        missingRequired.push(skill);
      }
    });
    reqScore = (matchedRequired.length / requiredSkills.length) * 40;
  } else {
    reqScore = 40; // No requirements specified
  }

  // 2. Preferred Skills Match (20% Weight)
  let matchedPreferred = [];
  let prefScore = 0;

  if (preferredSkills.length > 0) {
    preferredSkills.forEach((skill) => {
      const s = skill.toLowerCase().trim();
      if (candidateSkills.some((cs) => cs.includes(s) || s.includes(cs))) {
        matchedPreferred.push(skill);
      }
    });
    prefScore = (matchedPreferred.length / preferredSkills.length) * 20;
  } else {
    prefScore = 20;
  }

  // 3. Academic Criteria (20% Weight: CGPA + Backlogs)
  let academicScore = 0;
  if (candidateCgpa >= minCgpa) {
    academicScore += 15;
  } else {
    const ratio = Math.max(0, candidateCgpa / minCgpa);
    academicScore += ratio * 15;
  }

  if (candidateBacklogs <= maxBacklogs) {
    academicScore += 5;
  }

  // 4. Course & Graduation Year Fit (10% Weight)
  let fitScore = 0;
  if (
    eligibleCourses.length === 0 ||
    eligibleCourses.some((c) => candidateCourse.includes(c.toLowerCase()))
  ) {
    fitScore += 5;
  }
  if (!graduationYear || candidateGradYear === graduationYear) {
    fitScore += 5;
  }

  // 5. Projects & Certifications (10% Weight)
  let projectScore = 0;
  if (candidateProjects.length >= 2) projectScore += 5;
  else if (candidateProjects.length === 1) projectScore += 3;

  if (candidateCerts.length >= 1) projectScore += 5;

  const totalScore = Math.min(
    100,
    Math.round(reqScore + prefScore + academicScore + fitScore + projectScore)
  );

  return {
    matchScore: totalScore,
    disclaimer: 'Match Score — not a hiring guarantee.',
    breakdown: {
      requiredSkillsScore: Math.round(reqScore),
      preferredSkillsScore: Math.round(prefScore),
      academicScore: Math.round(academicScore),
      fitScore: Math.round(fitScore),
      portfolioScore: Math.round(projectScore),
    },
    matchedRequired,
    missingRequired,
    matchedPreferred,
    meetsAcademicCutoff: candidateCgpa >= minCgpa && candidateBacklogs <= maxBacklogs,
  };
};
