import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedData } from '../src/seed/seed.js';
import {
  User,
  Institution,
  SkillExchange,
  SkillModule,
  SkillLesson,
  ClassSection,
  Subject,
  Department,
  Timetable,
  FacultyProfile,
} from '../src/models/index.js';

let adminToken = '';
let facultyToken = '';
let studentToken = '';
let companyToken = '';

before(async () => {
  await seedData();

  // Obtain tokens for all 4 roles
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@sngce.edu',
    password: 'Admin@123',
    role: 'admin',
  });
  adminToken = adminRes.body.data.token;

  const facultyRes = await request(app).post('/api/auth/login').send({
    email: 'faculty@sngce.edu',
    password: 'Faculty@123',
    role: 'faculty',
  });
  facultyToken = facultyRes.body.data.token;

  const studentRes = await request(app).post('/api/auth/login').send({
    email: 'student@sngce.edu',
    password: 'Student@123',
    role: 'student',
  });
  studentToken = studentRes.body.data.token;

  const companyRes = await request(app).post('/api/auth/login').send({
    email: 'recruiter@techcorp.com',
    password: 'Company@123',
    role: 'company',
  });
  companyToken = companyRes.body.data.token;
});

after(async () => {
  await disconnectDB();
});

test('1. Auth & Role Restriction: rejects login with role mismatch', async () => {
  // Student trying to login as admin
  const res = await request(app).post('/api/auth/login').send({
    email: 'student@sngce.edu',
    password: 'Student@123',
    role: 'admin',
  });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Role mismatch/i);

  // Non-admin attempting to access admin dashboard stats
  const adminAccessRes = await request(app)
    .get('/api/admin/dashboard-stats')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(adminAccessRes.status, 403);
  assert.equal(adminAccessRes.body.success, false);
});

test('2. Admin Institution Uniqueness: rejects duplicate universityCollegeId registration', async () => {
  const duplicateRes = await request(app).post('/api/auth/register-admin').send({
    name: 'Duplicate Admin',
    email: 'anotheradmin@sngce.edu',
    password: 'Password@123',
    collegeName: 'sngce Duplicate Campus',
    universityCollegeId: 'SNGCE-UNIV-2026', // already registered in seed
  });

  assert.equal(duplicateRes.status, 409);
  assert.equal(duplicateRes.body.success, false);
  assert.match(duplicateRes.body.message, /already registered/i);
});

test('3. Admin Provisioning: admin can provision student account with institution binding', async () => {
  const institution = await Institution.findOne({ universityCollegeId: 'SNGCE-UNIV-2026' });
  const dept = await institution.populate('adminUser');

  const res = await request(app)
    .post('/api/auth/provision-user')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Rohan Verma',
      email: 'rohan.verma@sngce.edu',
      role: 'student',
      temporaryPassword: 'TempPassword@123',
      departmentId: dept._id,
      rollNumber: 'MCA-2024-099',
      course: 'MCA',
      semester: 4,
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, 'rohan.verma@sngce.edu');

  // Verify student can now login with provisioned credentials
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'rohan.verma@sngce.edu',
    password: 'TempPassword@123',
    role: 'student',
  });

  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.data.user.role, 'student');
});

test('4. Faculty Attendance Authorization: strictly verifies timetable allocation chain', async () => {
  const classSec = await ClassSection.findOne({ name: 'MCA Sem 3' });
  const sub = await Subject.findOne({ code: '20MCA207' }); // Cyber Forensics
  const student = await User.findOne({ email: 'alan@gmail.com' });

  // Period 8 is NOT allocated to Dr. Sandhya R for 20MCA207 on Monday
  const mondayDate = new Date();
  mondayDate.setDate(mondayDate.getDate() + ((1 + 7 - mondayDate.getDay()) % 7 || 7)); // Next Monday

  const unauthorizedRes = await request(app)
    .post('/api/faculty/attendance/submit')
    .set('Authorization', `Bearer ${facultyToken}`)
    .send({
      classSectionId: classSec._id,
      subjectId: sub._id,
      periodNumber: 8, // Period 8 is unassigned
      date: mondayDate.toISOString(),
      attendanceRecords: [{ studentId: student._id, status: 'Present' }],
    });

  assert.equal(unauthorizedRes.status, 403);
  assert.equal(unauthorizedRes.body.success, false);
  assert.match(unauthorizedRes.body.message, /Unauthorized|not assigned/i);

  // Period 5 IS allocated to Dr. Sandhya R for 20MCA207 on Monday
  const authorizedRes = await request(app)
    .post('/api/faculty/attendance/submit')
    .set('Authorization', `Bearer ${facultyToken}`)
    .send({
      classSectionId: classSec._id,
      subjectId: sub._id,
      periodNumber: 5,
      date: mondayDate.toISOString(),
      attendanceRecords: [{ studentId: student._id, status: 'Present' }],
      topicCovered: 'Digital Evidence Seizure',
    });

  assert.equal(authorizedRes.status, 200);
  assert.equal(authorizedRes.body.success, true);
});

test('5. Peer Skill Exchange, Sequential Modules, Evaluations & Tutor Feedback', async () => {
  const course = await SkillExchange.findOne({ skillName: 'React.js' });
  const student3 = await User.findOne({ email: 'adithyamanoj@gmail.com' });

  const student3Login = await request(app).post('/api/auth/login').send({
    email: 'adithyamanoj@gmail.com',
    password: 'Student@123',
    role: 'student',
  });
  const student3Token = student3Login.body.data.token;

  // 1. Peer Skill Exchange: Interested student requests to join
  const requestJoinRes = await request(app)
    .post(`/api/skills/courses/${course._id}/request-join`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ requestMessage: 'Excited to learn React hooks and patterns!' });

  assert.equal(requestJoinRes.status, 201);
  assert.equal(requestJoinRes.body.data.status, 'pending');

  // Duplicate join request is prevented
  const duplicateJoinRes = await request(app)
    .post(`/api/skills/courses/${course._id}/request-join`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(duplicateJoinRes.status, 400);
  assert.match(duplicateJoinRes.body.message, /already submitted a join request/i);

  // Before acceptance: course content is protected/redacted
  const pendingStatusRes = await request(app)
    .get(`/api/skills/courses/${course._id}`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(pendingStatusRes.status, 200);
  assert.equal(pendingStatusRes.body.data.isAccepted, false);
  assert.equal(pendingStatusRes.body.data.modules[0].lessons[0].content, null);

  // Tutor reviews and accepts the request
  const tutorRes = await request(app)
    .get('/api/skills/tutor/requests')
    .set('Authorization', `Bearer ${studentToken}`); // Aarav is studentToken (tutor)
  assert.equal(tutorRes.status, 200);
  const pendingReq = tutorRes.body.data.find((r) => r.learner._id === student3._id.toString());
  assert.ok(pendingReq);

  const reviewRes = await request(app)
    .patch(`/api/skills/requests/${pendingReq._id}/review`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ action: 'accept' });
  assert.equal(reviewRes.status, 200);
  assert.equal(reviewRes.body.data.status, 'active');

  // 2. Sequential Learning Modules: Accepted learner accesses course
  const statusRes = await request(app)
    .get(`/api/skills/courses/${course._id}`)
    .set('Authorization', `Bearer ${student3Token}`);

  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.data.isAccepted, true);
  const modules = statusRes.body.data.modules;
  assert.equal(modules[0].isUnlocked, true); // Module 1 is unlocked initially
  assert.equal(modules[1].isUnlocked, false); // Module 2 is locked

  // Resource can be marked as viewed
  const mod1Lesson1 = modules[0].lessons[0];
  const viewRes = await request(app)
    .post(`/api/skills/courses/${course._id}/lessons/${mod1Lesson1._id}/view`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(viewRes.status, 200);

  // Locked resources cannot be accessed directly (403 Forbidden)
  const mod2 = await SkillModule.findOne({ skillExchange: course._id, orderIndex: 2 });
  const mod2Lesson = await SkillLesson.findOne({ skillModule: mod2._id });

  const directLockedRes = await request(app)
    .get(`/api/skills/courses/${course._id}/lessons/${mod2Lesson._id}`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(directLockedRes.status, 403);
  assert.match(directLockedRes.body.message, /locked/i);

  // Completing Module 1 lessons unlocks Module 2
  const mod1Lessons = await SkillLesson.find({ skillModule: modules[0]._id });
  for (const les of mod1Lessons) {
    await request(app)
      .post(`/api/skills/courses/${course._id}/lessons/${les._id}/complete`)
      .set('Authorization', `Bearer ${student3Token}`);
  }

  // After completing Module 1: Module 2 must now be unlocked!
  const statusAfterMod1 = await request(app)
    .get(`/api/skills/courses/${course._id}`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(statusAfterMod1.body.data.modules[1].isUnlocked, true);

  // 3. Skill Evaluation and Recognition: Midpoint Evaluation
  // Midpoint is available since progress >= 50%
  const midEvalRes = await request(app)
    .post(`/api/skills/courses/${course._id}/evaluation/mid_term`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ answers: [1, 1] }); // Correct answers for midpoint questions
  assert.equal(midEvalRes.status, 200);
  assert.equal(midEvalRes.body.data.passed, true);
  assert.equal(midEvalRes.body.data.score, 100);

  // Attempting final evaluation before completing 100% of curriculum lessons is blocked (403)
  const prematureFinalRes = await request(app)
    .post(`/api/skills/courses/${course._id}/evaluation/final`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ answers: [1, 0, 1] });
  assert.equal(prematureFinalRes.status, 403);

  // Complete all remaining lessons (Module 2 and 3)
  const remainingLessons = await SkillLesson.find({
    skillExchange: course._id,
    skillModule: { $ne: modules[0]._id },
  });
  for (const les of remainingLessons) {
    await request(app)
      .post(`/api/skills/courses/${course._id}/lessons/${les._id}/complete`)
      .set('Authorization', `Bearer ${student3Token}`);
  }

  // Final evaluation: Calculate score, verify completion eligibility, generate Skill Card
  const finalEvalRes = await request(app)
    .post(`/api/skills/courses/${course._id}/evaluation/final`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ answers: [1, 0, 1] }); // 100% on final quiz questions
  assert.equal(finalEvalRes.status, 200);
  assert.equal(finalEvalRes.body.data.passed, true);
  assert.ok(finalEvalRes.body.data.achievement);
  assert.equal(finalEvalRes.body.data.achievement.student, student3._id.toString());
  assert.equal(finalEvalRes.body.data.achievement.skillName, 'React.js');
  assert.ok(finalEvalRes.body.data.achievement.assessedLevel); // e.g. "Advanced Mastery"

  // 4. Tutor Feedback:
  // Eligible completed student submits feedback
  const feedbackRes = await request(app)
    .post(`/api/skills/courses/${course._id}/feedback`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({
      rating: 5,
      review: 'Outstanding course structure and sequential progression. Very helpful peer tutor!',
      teachingClarity: 5,
      responsiveness: 5,
    });

  assert.equal(feedbackRes.status, 201);
  assert.equal(feedbackRes.body.data.rating, 5);
  assert.ok(feedbackRes.body.tutorRank);

  // Duplicate feedback is prevented
  const duplicateFeedbackRes = await request(app)
    .post(`/api/skills/courses/${course._id}/feedback`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ rating: 4, review: 'Duplicate attempt' });
  assert.equal(duplicateFeedbackRes.status, 400);
  assert.match(duplicateFeedbackRes.body.message, /One feedback record is allowed/i);
});

test('6. Company Talent Discovery: filters public candidates and computes explainable Match Score', async () => {
  const searchRes = await request(app)
    .get('/api/company/candidates/search?skills=React.js,Node.js&minCgpa=8.0')
    .set('Authorization', `Bearer ${companyToken}`);

  assert.equal(searchRes.status, 200);
  assert.equal(searchRes.body.success, true);
  assert.equal(searchRes.body.disclaimer, 'Match Score — not a hiring guarantee.');

  const candidates = searchRes.body.data;
  assert.ok(candidates.length > 0);

  const aarav = candidates.find((c) => c.name === 'Alan Santu');
  assert.ok(aarav);
  assert.ok(aarav.matchScore >= 80);
  assert.ok(aarav.matchDetails.breakdown);
  assert.equal(aarav.contactEmail, 'Hidden until Screening'); // Privacy rule check
});

test('7. Resume Generator: allows unlimited generations without cooldown limit', async () => {
  // First generation: must succeed
  const gen1Res = await request(app)
    .post('/api/resumes/generate')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ templateId: 'modern_tech' });

  assert.equal(gen1Res.status, 200);
  assert.equal(gen1Res.body.success, true);

  // Immediate second generation attempt: MUST ALSO SUCCEED (no cooldown limit)
  const gen2Res = await request(app)
    .post('/api/resumes/generate')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ templateId: 'modern_tech' });

  assert.equal(gen2Res.status, 200);
  assert.equal(gen2Res.body.success, true);
  assert.equal(gen2Res.body.data.remainingTimeFormatted, 'Eligible now');

  // Update Resume Customizations: skills, experience, projects
  const updateRes = await request(app)
    .put('/api/resumes/update')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      headline: 'Full Stack Engineer & Cloud Architect',
      experience: [
        {
          role: 'Backend Intern',
          company: 'Acme Cloud Inc',
          duration: 'Jan 2025 - Mar 2025',
          location: 'Remote',
          description: 'Engineered high-throughput microservices using Node.js and Docker.',
        },
      ],
      projects: [
        {
          title: 'Custom AI Search Engine',
          description: 'Vector-indexed retrieval system using LangChain.',
          techStack: ['Python', 'FastAPI', 'ChromaDB'],
          link: 'https://github.com/test/custom-ai',
        },
      ],
      skills: [
        {
          category: 'Cloud & DevOps',
          items: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
        },
      ],
    });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.success, true);
  assert.equal(updateRes.body.data.headline, 'Full Stack Engineer & Cloud Architect');
  assert.equal(updateRes.body.data.experience.length, 1);
  assert.equal(updateRes.body.data.experience[0].role, 'Backend Intern');
  assert.equal(updateRes.body.data.projects[0].title, 'Custom AI Search Engine');

  // Preview should reflect custom updates
  const previewRes = await request(app)
    .get('/api/resumes/preview')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(previewRes.status, 200);
  assert.equal(previewRes.body.data.headline, 'Full Stack Engineer & Cloud Architect');
  assert.equal(previewRes.body.data.experience[0].role, 'Backend Intern');

  // Reset should restore profile defaults
  const resetRes = await request(app)
    .post('/api/resumes/reset')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(resetRes.status, 200);
  assert.equal(resetRes.body.success, true);

  // Submit Feedback test
  const feedbackRes = await request(app)
    .post('/api/resumes/feedback')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      rating: 5,
      suggestions: 'Love the modern template design and speed!',
      templateId: 'modern_tech',
    });

  assert.equal(feedbackRes.status, 201);
  assert.equal(feedbackRes.body.success, true);
  assert.equal(feedbackRes.body.data.rating, 5);
  assert.equal(feedbackRes.body.data.suggestions, 'Love the modern template design and speed!');

  const getFeedbackRes = await request(app)
    .get('/api/resumes/feedback')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(getFeedbackRes.status, 200);
  assert.equal(getFeedbackRes.body.success, true);
  assert.ok(getFeedbackRes.body.data.length >= 1);
});

test('8. Skill Course Creation & Mid-Term Gating: validates 30+ questions, dynamic modules/materials, and second-half gating', async () => {
  // 1. Validation: Rejects course creation with fewer than 2 modules
  const invalidModRes = await request(app)
    .post('/api/skills/courses')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      title: 'Docker & Kubernetes Mastery',
      skillName: 'DevOps',
      description: 'Container orchestration from scratch.',
      modules: [{ title: 'Module 1', lessons: [] }],
    });
  assert.equal(invalidModRes.status, 400);
  assert.match(invalidModRes.body.message, /at least 2 modules/i);

  // 2. Validation: Rejects course creation with fewer than 30 evaluation questions
  const invalidQRes = await request(app)
    .post('/api/skills/courses')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      title: 'Docker & Kubernetes Mastery',
      skillName: 'DevOps',
      description: 'Container orchestration from scratch.',
      modules: [
        { title: 'Module 1: Docker Basics', lessons: [] },
        { title: 'Module 2: Kubernetes Clusters', lessons: [] },
      ],
      evaluations: {
        midterm: {
          questions: [
            { questionText: 'Q1', options: ['A', 'B', 'C', 'D'], correctOptionIndex: 0 },
          ],
        },
        final: {
          questions: [
            { questionText: 'Q2', options: ['A', 'B', 'C', 'D'], correctOptionIndex: 0 },
          ],
        },
      },
    });
  assert.equal(invalidQRes.status, 400);
  assert.match(invalidQRes.body.message, /minimum of 30 questions/i);

  // 3. Successful Creation: 2 modules, rich materials, and 30 questions (15 midterm + 15 final)
  const generateQuestions = (prefix, count) =>
    Array.from({ length: count }, (_, i) => ({
      questionText: `${prefix} Question ${i + 1}: Conceptual evaluation test item`,
      options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      points: 10,
    }));

  const validCourseRes = await request(app)
    .post('/api/skills/courses')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      title: 'Full-Stack TypeScript & Node Architectures',
      skillName: 'TypeScript',
      description: 'Production-ready TypeScript microservices and clean architecture.',
      skillLevel: 'intermediate',
      estimatedDuration: '4 Weeks',
      modules: [
        {
          title: 'Module 1: Advanced Types & Generics',
          description: 'Type gymnastics, conditional types, and Mapped Types.',
          lessons: [
            {
              title: 'Lesson 1.1: Generics & Utility Types',
              materialType: 'youtube',
              youtubeUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
              durationMinutes: 20,
              content: 'Understanding key generic constraints.',
            },
            {
              title: 'Lesson 1.2: Architecture Whitepaper',
              materialType: 'document',
              documentUrl: 'https://example.com/ts-whitepaper.pdf',
              documentName: 'TS-Clean-Architecture.pdf',
              durationMinutes: 15,
              content: 'Read the accompanying design document.',
            },
          ],
        },
        {
          title: 'Module 2: Microservices & Event Architecture',
          description: 'Deploying robust TypeScript workers.',
          lessons: [
            {
              title: 'Lesson 2.1: Event Bus Integration',
              materialType: 'video_recording',
              videoRecordingUrl: 'https://example.com/recordings/ts-session-2.mp4',
              durationMinutes: 30,
              content: 'Building event subscribers.',
            },
          ],
        },
      ],
      evaluations: {
        midterm: {
          title: 'TypeScript Mid-Term Assessment',
          passingScore: 60,
          questions: generateQuestions('Midterm', 15),
        },
        final: {
          title: 'TypeScript Final Mastery Evaluation',
          passingScore: 60,
          questions: generateQuestions('Final', 15),
        },
      },
    });

  assert.equal(validCourseRes.status, 201);
  assert.equal(validCourseRes.body.success, true);
  const newCourseId = validCourseRes.body.data._id;

  // Student 3 requests to join the new course
  const student3Login = await request(app).post('/api/auth/login').send({
    email: 'student3@sngce.edu',
    password: 'Student@123',
    role: 'student',
  });
  const student3Token = student3Login.body.data.token;

  await request(app)
    .post(`/api/skills/courses/${newCourseId}/request-join`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ requestMessage: 'Want to master TypeScript!' });

  // Tutor accepts student 3
  const tutorReqs = await request(app)
    .get('/api/skills/tutor/requests')
    .set('Authorization', `Bearer ${studentToken}`);
  const reqToAccept = tutorReqs.body.data.find(
    (r) => r.skillExchange._id === newCourseId
  );
  await request(app)
    .patch(`/api/skills/requests/${reqToAccept._id}/review`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ action: 'accept' });

  // Student checks course: Module 1 unlocked, Module 2 (second half) locked
  const initialStatus = await request(app)
    .get(`/api/skills/courses/${newCourseId}`)
    .set('Authorization', `Bearer ${student3Token}`);

  assert.equal(initialStatus.body.data.modules[0].isUnlocked, true);
  assert.equal(initialStatus.body.data.modules[1].isUnlocked, false);
  assert.equal(initialStatus.body.data.modules[1].isSecondHalf, true);

  // Student completes all lessons in Module 1 (first half)
  const mod1Lessons = initialStatus.body.data.modules[0].lessons;
  for (const les of mod1Lessons) {
    await request(app)
      .post(`/api/skills/courses/${newCourseId}/lessons/${les._id}/complete`)
      .set('Authorization', `Bearer ${student3Token}`);
  }

  // After Module 1 is finished, Module 2 is in the second half so it MUST REMAIN LOCKED until Mid-Term is passed with >= 60%!
  const statusAfterMod1 = await request(app)
    .get(`/api/skills/courses/${newCourseId}`)
    .set('Authorization', `Bearer ${student3Token}`);

  assert.equal(statusAfterMod1.body.data.modules[1].isUnlocked, false);
  assert.equal(statusAfterMod1.body.data.modules[1].lockedReason, 'midterm_required');

  // Attempting to access or complete Module 2 lesson directly is blocked (403)
  const mod2LessonId = statusAfterMod1.body.data.modules[1].lessons[0]._id;
  const lockedAccessRes = await request(app)
    .get(`/api/skills/courses/${newCourseId}/lessons/${mod2LessonId}`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(lockedAccessRes.status, 403);
  assert.match(lockedAccessRes.body.message, /unlock the second half of the course/i);

  // Student takes Mid-Term Evaluation but scores below 60% (e.g. 0% by giving wrong answer index 3)
  const failedMidRes = await request(app)
    .post(`/api/skills/courses/${newCourseId}/evaluation/mid_term`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ answers: Array(15).fill(3) }); // all wrong
  assert.equal(failedMidRes.status, 200);
  assert.equal(failedMidRes.body.data.passed, false);
  assert.equal(failedMidRes.body.data.score, 0);

  // Module 2 remains locked after failing midterm!
  const statusAfterFail = await request(app)
    .get(`/api/skills/courses/${newCourseId}`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(statusAfterFail.body.data.modules[1].isUnlocked, false);

  // Student retakes Mid-Term Evaluation with correct answers (score 100% >= 60%)
  const passedMidRes = await request(app)
    .post(`/api/skills/courses/${newCourseId}/evaluation/mid_term`)
    .set('Authorization', `Bearer ${student3Token}`)
    .send({ answers: Array(15).fill(0) }); // all correct
  assert.equal(passedMidRes.status, 200);
  assert.equal(passedMidRes.body.data.passed, true);
  assert.equal(passedMidRes.body.data.score, 100);

  // Now Module 2 (second half) is UNLOCKED!
  const statusAfterPass = await request(app)
    .get(`/api/skills/courses/${newCourseId}`)
    .set('Authorization', `Bearer ${student3Token}`);
  assert.equal(statusAfterPass.body.data.modules[1].isUnlocked, true);
});

test('9. Admin Student & Faculty CRUD with Email & Password Credential Updates', async () => {
  const deptsRes = await request(app)
    .get('/api/admin/departments')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deptsRes.status, 200);
  const deptId = deptsRes.body.data[0]._id;

  // 1. Provision new student via admin route
  const provStudentRes = await request(app)
    .post('/api/admin/students')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Rohan Verma',
      email: 'rohan.initial@sngce.edu',
      temporaryPassword: 'InitialPass@123',
      departmentId: deptId,
      rollNumber: 'MCA-TEST-001',
      course: 'Master of Computer Applications (MCA)',
      semester: 4,
      graduationYear: 2026,
      cgpa: 8.2,
    });
  assert.equal(provStudentRes.status, 201);
  assert.equal(provStudentRes.body.success, true);
  const studentProfileId = provStudentRes.body.data._id;

  // Verify student can log in with initial credentials
  const initialLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'rohan.initial@sngce.edu',
      password: 'InitialPass@123',
      role: 'student',
    });
  assert.equal(initialLoginRes.status, 200);

  // 2. Admin edits student: changes roll number, name, email AND password
  const editStudentRes = await request(app)
    .put(`/api/admin/students/${studentProfileId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Rohan Verma Updated',
      email: 'rohan.updated@sngce.edu',
      password: 'NewSecretPassword@123',
      departmentId: deptId,
      rollNumber: 'MCA-TEST-001-REV',
      semester: 4,
      cgpa: 9.1,
    });
  assert.equal(editStudentRes.status, 200);
  assert.equal(editStudentRes.body.success, true);
  assert.equal(editStudentRes.body.data.user.email, 'rohan.updated@sngce.edu');
  assert.equal(editStudentRes.body.data.user.name, 'Rohan Verma Updated');
  assert.equal(editStudentRes.body.data.rollNumber, 'MCA-TEST-001-REV');

  // Verify old email/password no longer works
  const oldLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'rohan.initial@sngce.edu',
      password: 'InitialPass@123',
      role: 'student',
    });
  assert.equal(oldLoginRes.status, 401);

  // Verify new email and new password log in successfully
  const newLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'rohan.updated@sngce.edu',
      password: 'NewSecretPassword@123',
      role: 'student',
    });
  assert.equal(newLoginRes.status, 200);
  assert.equal(newLoginRes.body.data.user.name, 'Rohan Verma Updated');

  // 3. Admin deletes student
  const deleteStudentRes = await request(app)
    .delete(`/api/admin/students/${studentProfileId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleteStudentRes.status, 200);
  assert.equal(deleteStudentRes.body.success, true);

  // Deleted student can no longer login
  const deletedLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'rohan.updated@sngce.edu',
      password: 'NewSecretPassword@123',
      role: 'student',
    });
  assert.equal(deletedLoginRes.status, 401);

  // 4. Provision new faculty via admin route
  const provFacultyRes = await request(app)
    .post('/api/admin/faculty')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Prof. Suresh Nair',
      email: 'suresh.initial@sngce.edu',
      temporaryPassword: 'FacultyPass@123',
      departmentId: deptId,
      employeeId: 'FAC-TEST-99',
      designation: 'Assistant Professor',
      qualification: 'M.Tech, Ph.D.',
      experienceYears: 5,
    });
  assert.equal(provFacultyRes.status, 201);
  const facultyProfileId = provFacultyRes.body.data._id;

  // 5. Admin edits faculty: changes designation, employee ID, email AND password
  const editFacultyRes = await request(app)
    .put(`/api/admin/faculty/${facultyProfileId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Dr. Suresh Nair',
      email: 'suresh.updated@sngce.edu',
      password: 'NewFacultyPass@123',
      departmentId: deptId,
      employeeId: 'FAC-TEST-99-REV',
      designation: 'Associate Professor',
      experienceYears: 6,
    });
  assert.equal(editFacultyRes.status, 200);
  assert.equal(editFacultyRes.body.data.user.email, 'suresh.updated@sngce.edu');
  assert.equal(editFacultyRes.body.data.employeeId, 'FAC-TEST-99-REV');

  // Verify faculty logs in with new credentials
  const facNewLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'suresh.updated@sngce.edu',
      password: 'NewFacultyPass@123',
      role: 'faculty',
    });
  assert.equal(facNewLoginRes.status, 200);
  assert.equal(facNewLoginRes.body.data.user.name, 'Dr. Suresh Nair');

  // 6. Admin deletes faculty
  const deleteFacRes = await request(app)
    .delete(`/api/admin/faculty/${facultyProfileId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleteFacRes.status, 200);
  assert.equal(deleteFacRes.body.success, true);

  // Deleted faculty cannot log in
  const deletedFacLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'suresh.updated@sngce.edu',
      password: 'NewFacultyPass@123',
      role: 'faculty',
    });
  assert.equal(deletedFacLoginRes.status, 401);
});

test('10. Admin Department Management: Edit Department and Change HOD', async () => {
  // 1. Fetch departments
  const deptsRes = await request(app)
    .get('/api/admin/departments')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deptsRes.status, 200);
  assert.ok(deptsRes.body.data.length > 0);
  const targetDept = deptsRes.body.data[0];

  // 2. Fetch faculty list
  const facultyRes = await request(app)
    .get('/api/admin/faculty')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(facultyRes.status, 200);
  assert.ok(facultyRes.body.data.length > 0);
  const facultyUser = facultyRes.body.data[0].user;

  // 3. Edit department details and assign faculty as HOD
  const updateRes = await request(app)
    .put(`/api/admin/departments/${targetDept._id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `${targetDept.name} (Updated)`,
      code: targetDept.code,
      description: 'Department overview updated with cutting-edge curricula.',
      facultyUserId: facultyUser._id,
    });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.success, true);
  assert.equal(updateRes.body.data.name, `${targetDept.name} (Updated)`);
  assert.equal(updateRes.body.data.hodName, facultyUser.name);
  assert.equal(updateRes.body.data.hodUser._id.toString(), facultyUser._id.toString());
  assert.equal(updateRes.body.data.hodUser.isHod, true);

  // 4. Edit department and unassign HOD
  const unassignRes = await request(app)
    .put(`/api/admin/departments/${targetDept._id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: targetDept.name,
      code: targetDept.code,
      description: targetDept.description,
      facultyUserId: '',
    });

  assert.equal(unassignRes.status, 200);
  assert.equal(unassignRes.body.success, true);
  assert.equal(unassignRes.body.data.hodUser, null);
  assert.equal(unassignRes.body.data.hodName, '');
});

test('11. Faculty Advisor (FA) Role: HOD assignment, class-specific timetable scheduling, and faculty weekly view', async () => {
  // Ensure MCA department has Dr. Sandhya R as HOD (since test 10 tested unassigning HOD)
  const mcaDept = await Department.findOne({ code: 'MCA' });
  const hodFaculty = await User.findOne({ email: 'sandhya@gmail.com' });
  mcaDept.hodUser = hodFaculty._id;
  mcaDept.hodName = hodFaculty.name;
  await mcaDept.save();
  await User.findByIdAndUpdate(hodFaculty._id, { isHod: true });
  await FacultyProfile.findOneAndUpdate({ user: hodFaculty._id }, { isHod: true });

  // 1. Log in HOD (Dr. Sandhya R)
  const hodLogin = await request(app).post('/api/auth/login').send({
    email: 'sandhya@gmail.com',
    password: '1234567890',
    role: 'faculty',
  });
  assert.equal(hodLogin.status, 200);
  assert.equal(hodLogin.body.data.user.isHod, true);
  const hodToken = hodLogin.body.data.token;
  const hodId = hodLogin.body.data.user._id;

  // 2. Log in Faculty (Jisha Abraham - designated FA for MCA Sem 3)
  const faLogin = await request(app).post('/api/auth/login').send({
    email: 'jisha@gmail.com',
    password: '1234567890',
    role: 'faculty',
  });
  assert.equal(faLogin.status, 200);
  assert.equal(faLogin.body.data.user.isFa, true);
  assert.ok(faLogin.body.data.user.faClasses.length > 0);
  const faToken = faLogin.body.data.token;
  const faId = faLogin.body.data.user._id;

  // 3. Find classes and subjects
  const mcaSem3 = await ClassSection.findOne({ name: 'MCA Sem 3' });
  const mcaSem2 = await ClassSection.findOne({ name: 'MCA Sem 2' });
  const subDAA = await Subject.findOne({ code: '20MCA203' });

  assert.ok(mcaSem3);
  assert.ok(mcaSem2);
  assert.ok(subDAA);

  // 4. HOD assigns Jisha Abraham as FA for MCA Sem 2 as well
  const assignFaRes = await request(app)
    .post('/api/faculty/hod/assign-fa')
    .set('Authorization', `Bearer ${hodToken}`)
    .send({
      classSectionId: mcaSem2._id,
      facultyId: faId,
    });
  assert.equal(assignFaRes.status, 200);
  assert.equal(assignFaRes.body.success, true);
  assert.equal(assignFaRes.body.data.facultyAdvisor._id.toString(), faId.toString());

  // 5. Non-FA (Dr. Sandhya R for Sem 3, who is HOD but not FA) attempts to schedule timetable for MCA Sem 3 -> 403 Forbidden
  const unauthorizedScheduleRes = await request(app)
    .post('/api/faculty/hod/timetable/save')
    .set('Authorization', `Bearer ${hodToken}`)
    .send({
      classSectionId: mcaSem3._id,
      dayOfWeek: 'Saturday',
      periodNumber: 1,
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      subjectId: subDAA._id,
      facultyId: hodId,
      roomNumber: 'Hall 301',
    });
  assert.equal(unauthorizedScheduleRes.status, 403);
  assert.equal(unauthorizedScheduleRes.body.success, false);
  assert.match(unauthorizedScheduleRes.body.message, /Faculty Advisor/i);

  // 6. Authorized FA (Jisha Abraham) schedules timetable for MCA Sem 3 -> 200 OK
  const authorizedScheduleRes = await request(app)
    .post('/api/faculty/hod/timetable/save')
    .set('Authorization', `Bearer ${faToken}`)
    .send({
      classSectionId: mcaSem3._id,
      dayOfWeek: 'Saturday',
      periodNumber: 1,
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      subjectId: subDAA._id,
      facultyId: hodId, // FA allocates Dr. Sandhya R to teach this period
      roomNumber: 'Lab Block 302',
    });
  assert.equal(authorizedScheduleRes.status, 200);
  assert.equal(authorizedScheduleRes.body.success, true);
  const createdEntryId = authorizedScheduleRes.body.data._id;

  // 7. FA publishes the timetable for MCA Sem 3
  const publishRes = await request(app)
    .post('/api/faculty/hod/timetable/publish')
    .set('Authorization', `Bearer ${faToken}`)
    .send({ classSectionId: mcaSem3._id });
  assert.equal(publishRes.status, 200);
  assert.equal(publishRes.body.success, true);

  // 8. The other faculty (Dr. Sandhya R) can see their allocated class in their weekly timetable
  const weeklyScheduleRes = await request(app)
    .get('/api/faculty/schedule/weekly')
    .set('Authorization', `Bearer ${hodToken}`);
  assert.equal(weeklyScheduleRes.status, 200);
  assert.equal(weeklyScheduleRes.body.success, true);
  const myAllocations = weeklyScheduleRes.body.data.allocations;
  assert.ok(myAllocations.length > 0);
  const foundSaturdaySlot = myAllocations.find(
    (a) => a.dayOfWeek === 'Saturday' && a.periodNumber === 1
  );
  assert.ok(foundSaturdaySlot, 'Allocated Saturday period should be visible in faculty timetable');
  assert.equal(foundSaturdaySlot.classSection.name, 'MCA Sem 3');

  // 9. HOD has the full view of all class timetables in the department
  const hodViewRes = await request(app)
    .get('/api/faculty/hod/timetable')
    .set('Authorization', `Bearer ${hodToken}`);
  assert.equal(hodViewRes.status, 200);
  assert.equal(hodViewRes.body.success, true);
  assert.equal(hodViewRes.body.data.isHod, true);
  assert.ok(hodViewRes.body.data.classSections.length >= 2);
  assert.ok(hodViewRes.body.data.timetableEntries.length > 0);

  // Clean up created test entry
  await Timetable.findByIdAndDelete(createdEntryId);
});

test('12. Peer Study Room Live Chat, Presence Alerts & Meeting Link Management', async () => {
  // Find a course and its tutor
  const course = await SkillExchange.findOne().populate('tutor');
  assert.ok(course, 'A seeded skill exchange course must exist');

  // Obtain login token for the course tutor
  const tutorLoginRes = await request(app).post('/api/auth/login').send({
    email: course.tutor.email,
    password: 'Password@123',
    role: 'student',
  });
  // Fallback to default password if Password@123 differs
  let tutorToken = tutorLoginRes.body.data?.token;
  if (!tutorToken) {
    const fallbackRes = await request(app).post('/api/auth/login').send({
      email: course.tutor.email,
      password: '1234567890',
      role: 'student',
    });
    tutorToken = fallbackRes.body.data?.token;
  }
  assert.ok(tutorToken, 'Tutor token should be obtained');

  // 1. Get Course Chat thread
  const chatRes = await request(app)
    .get(`/api/skills/courses/${course._id}/chat`)
    .set('Authorization', `Bearer ${tutorToken}`);
  assert.equal(chatRes.status, 200);
  assert.equal(chatRes.body.success, true);
  assert.ok(chatRes.body.data.meetingLink);
  assert.ok(Array.isArray(chatRes.body.data.messages));

  // 2. Tutor sends normal chat message
  const msgRes = await request(app)
    .post(`/api/skills/courses/${course._id}/chat/messages`)
    .set('Authorization', `Bearer ${tutorToken}`)
    .send({ content: 'Welcome to our peer study room session!' });
  assert.equal(msgRes.status, 201);
  assert.equal(msgRes.body.success, true);
  assert.equal(msgRes.body.data.content, 'Welcome to our peer study room session!');

  // 3. Broadcast Study Room Ping alert
  const pingRes = await request(app)
    .post(`/api/skills/courses/${course._id}/chat/messages`)
    .set('Authorization', `Bearer ${tutorToken}`)
    .send({ isStudyRoomPing: true });
  assert.equal(pingRes.status, 201);
  assert.equal(pingRes.body.success, true);
  assert.ok(pingRes.body.data.content.includes('🎥'));

  // 4. Tutor updates Meeting Link
  const newLink = `https://meet.jit.si/PeerX-CustomStudyRoom-${course._id}`;
  const updateLinkRes = await request(app)
    .patch(`/api/skills/courses/${course._id}/meeting-link`)
    .set('Authorization', `Bearer ${tutorToken}`)
    .send({ meetingLink: newLink });
  assert.equal(updateLinkRes.status, 200);
  assert.equal(updateLinkRes.body.success, true);
  assert.equal(updateLinkRes.body.data.meetingLink, newLink);

  // 5. Verify updated chat reflects the new meeting link and announcement message
  const chatAfterRes = await request(app)
    .get(`/api/skills/courses/${course._id}/chat`)
    .set('Authorization', `Bearer ${tutorToken}`);
  assert.equal(chatAfterRes.body.data.meetingLink, newLink);
  const lastMsg = chatAfterRes.body.data.messages.slice(-1)[0];
  assert.ok(lastMsg.content.includes(newLink));
  assert.equal(chatAfterRes.body.data.activeStudyRoom?.isActive, true);

  // 6. Tutor ends study room session
  const endRes = await request(app)
    .post(`/api/skills/courses/${course._id}/chat/end-session`)
    .set('Authorization', `Bearer ${tutorToken}`);
  assert.equal(endRes.status, 200);
  assert.equal(endRes.body.success, true);
  assert.equal(endRes.body.data.activeStudyRoom?.isActive, false);
  assert.ok(endRes.body.data.message.content.includes('🏁'));

  // 7. Verify chat data now shows activeStudyRoom is false
  const chatFinalRes = await request(app)
    .get(`/api/skills/courses/${course._id}/chat`)
    .set('Authorization', `Bearer ${tutorToken}`);
  assert.equal(chatFinalRes.body.data.activeStudyRoom?.isActive, false);
});




