import express from 'express';
import {
  login,
  registerAdmin,
  registerCompany,
  provisionUser,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.post('/register-company', registerCompany);
router.post('/provision-user', authenticate, authorizeRoles('admin'), provisionUser);
router.get('/me', authenticate, getMe);

export default router;
