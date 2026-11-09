import express from 'express';
import {
  getDashboardSummary,
  getAttendanceDetails,
  getTimetable,
  getStudyMaterials,
  getAssignments,
  submitAssignment,
  submitComplaint,
  getMyComplaints,
  getMyResults,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('student'));

router.get('/dashboard-summary', getDashboardSummary);
router.get('/attendance', getAttendanceDetails);
router.get('/timetable', getTimetable);
router.get('/materials', getStudyMaterials);
router.get('/assignments', getAssignments);
router.post('/assignments/:assignmentId/submit', upload.single('file'), submitAssignment);
router.post('/complaints', submitComplaint);
router.get('/complaints', getMyComplaints);
router.get('/results', getMyResults);

export default router;
