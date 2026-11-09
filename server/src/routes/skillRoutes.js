import express from 'express';
import {
  getCourses,
  getCourseDetails,
  createCourse,
  enrollInCourse,
  requestJoinCourse,
  getTutorRequests,
  reviewJoinRequest,
  markLessonViewed,
  markLessonComplete,
  getLessonResource,
  submitEvaluation,
  submitFeedback,
  getCourseFeedback,
  getAchievementCertificate,
  getMyLearningSummary,
  uploadSkillMaterial,
  getCourseChat,
  sendCourseChatMessage,
  endCourseStudyRoom,
  updateCourseMeetingLink,
} from '../controllers/skillExchangeController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Course browsing & public achievement retrieval for authenticated users
router.get('/courses', authenticate, getCourses);
router.get('/courses/:courseId', authenticate, getCourseDetails);
router.get('/courses/:courseId/feedback', authenticate, getCourseFeedback);
router.get('/achievements/:achievementId', authenticate, getAchievementCertificate);

// Student actions & material upload
router.get('/my-learning', authenticate, authorizeRoles('student'), getMyLearningSummary);
router.post('/courses', authenticate, authorizeRoles('student'), createCourse);
router.post('/upload-material', authenticate, authorizeRoles('student'), upload.single('file'), uploadSkillMaterial);

// Peer Skill Exchange: Join Requests & Tutor Review
router.post('/courses/:courseId/request-join', authenticate, authorizeRoles('student'), requestJoinCourse);
router.post('/courses/:courseId/enroll', authenticate, authorizeRoles('student'), enrollInCourse);
router.get('/tutor/requests', authenticate, authorizeRoles('student'), getTutorRequests);
router.patch('/requests/:enrollmentId/review', authenticate, authorizeRoles('student'), reviewJoinRequest);

// Sequential Learning Modules: Lessons & Locked Resource Protection
router.get('/courses/:courseId/lessons/:lessonId', authenticate, authorizeRoles('student'), getLessonResource);
router.post('/courses/:courseId/lessons/:lessonId/view', authenticate, authorizeRoles('student'), markLessonViewed);
router.post('/courses/:courseId/lessons/:lessonId/complete', authenticate, authorizeRoles('student'), markLessonComplete);

// Skill Evaluation & Recognition: Midpoint & Final
router.post('/courses/:courseId/evaluation', authenticate, authorizeRoles('student'), submitEvaluation);
router.post('/courses/:courseId/evaluation/:evaluationType', authenticate, authorizeRoles('student'), submitEvaluation);

// Tutor Feedback: Ratings & Reviews
router.post('/courses/:courseId/feedback', authenticate, authorizeRoles('student'), submitFeedback);

// Course Discussion & Study Room Live Chat
router.get('/courses/:courseId/chat', authenticate, authorizeRoles('student'), getCourseChat);
router.post('/courses/:courseId/chat/messages', authenticate, authorizeRoles('student'), sendCourseChatMessage);
router.post('/courses/:courseId/chat/end-session', authenticate, authorizeRoles('student'), endCourseStudyRoom);
router.patch('/courses/:courseId/meeting-link', authenticate, authorizeRoles('student'), updateCourseMeetingLink);

export default router;
