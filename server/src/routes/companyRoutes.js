import express from 'express';
import {
  getDashboardStats,
  searchCandidates,
  getCandidateDetail,
  toggleCandidateShortlist,
  updatePipelineStatus,
  getShortlistedCandidates,
  getOpportunities,
  createOpportunity,
  getInstitutionsList,
} from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('company'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/candidates/search', searchCandidates);
router.get('/candidates/:studentUserId', getCandidateDetail);

router.post('/shortlist', toggleCandidateShortlist);
router.get('/shortlist', getShortlistedCandidates);
router.patch('/shortlist/:shortlistId/status', updatePipelineStatus);

router.get('/opportunities', getOpportunities);
router.post('/opportunities', createOpportunity);

router.get('/institutions', getInstitutionsList);

export default router;
