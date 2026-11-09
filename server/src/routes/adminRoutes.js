import express from 'express';
import {
  getDashboardStats,
  getStudents,
  getFacultyList,
  toggleUserStatus,
  createStudent,
  updateStudent,
  deleteStudent,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHod,
  createAnnouncement,
  createEvent,
  getComplaints,
  updateComplaintStatus,
  getApprovals,
  reviewApproval,
  getCommunicationAnalytics,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, authorizeRoles('admin'));

router.get('/dashboard-stats', getDashboardStats);

// Student CRUD
router.get('/students', getStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Faculty CRUD
router.get('/faculty', getFacultyList);
router.post('/faculty', createFaculty);
router.put('/faculty/:id', updateFaculty);
router.delete('/faculty/:id', deleteFaculty);

router.patch('/users/:userId/toggle-status', toggleUserStatus);

router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.post('/assign-hod', assignHod);

router.post('/announcements', createAnnouncement);
router.post('/events', createEvent);

router.get('/complaints', getComplaints);
router.patch('/complaints/:complaintId', updateComplaintStatus);

router.get('/approvals', getApprovals);
router.patch('/approvals/:approvalId', reviewApproval);

router.get('/analytics', getCommunicationAnalytics);

export default router;
