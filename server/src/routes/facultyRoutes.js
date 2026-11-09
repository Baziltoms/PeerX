import express from 'express';
import {
  getDashboard,
  getTodaySchedule,
  getStudentsForAttendance,
  submitAttendance,
  getAttendanceHistory,
  uploadStudyMaterial,
  getFacultyMaterials,
  createAssignment,
  getFacultyAssignments,
  getSubmissionsForAssignment,
  gradeSubmission,
  getFacultyAssignedClasses,
  getHodTimetableData,
  saveTimetableEntry,
  publishTimetable,
  deleteTimetableEntry,
  assignFacultyAdvisor,
  unassignFacultyAdvisor,
  getFacultyWeeklySchedule,
} from '../controllers/facultyController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('faculty'));

router.get('/dashboard', getDashboard);
router.get('/schedule/today', getTodaySchedule);
router.get('/schedule/weekly', getFacultyWeeklySchedule);
router.get('/attendance/students', getStudentsForAttendance);
router.post('/attendance/submit', submitAttendance);
router.get('/attendance/history', getAttendanceHistory);

router.get('/assigned-classes', getFacultyAssignedClasses);
router.get('/materials', getFacultyMaterials);
router.post('/materials', upload.single('file'), uploadStudyMaterial);

router.get('/assignments', getFacultyAssignments);
router.post('/assignments', createAssignment);
router.get('/assignments/:assignmentId/submissions', getSubmissionsForAssignment);
router.patch('/submissions/:submissionId/grade', gradeSubmission);

// HOD & FA Timetable Management Routes
router.get('/hod/timetable', getHodTimetableData);
router.post('/hod/assign-fa', assignFacultyAdvisor);
router.post('/hod/unassign-fa', unassignFacultyAdvisor);
router.post('/hod/timetable/save', saveTimetableEntry);
router.post('/hod/timetable/publish', publishTimetable);
router.delete('/hod/timetable/entry/:entryId', deleteTimetableEntry);

export default router;
