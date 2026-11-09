import express from 'express';
import {
  getResumeEligibility,
  previewResume,
  generateResume,
  updateResume,
  resetResume,
  getMySavedResume,
  submitResumeFeedback,
  getResumeFeedback,
} from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('student'));

router.get('/eligibility', getResumeEligibility);
router.get('/preview', previewResume);
router.post('/generate', generateResume);
router.put('/update', updateResume);
router.post('/reset', resetResume);
router.get('/my-resume', getMySavedResume);
router.post('/feedback', submitResumeFeedback);
router.get('/feedback', getResumeFeedback);

export default router;
