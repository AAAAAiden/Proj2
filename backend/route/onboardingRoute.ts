import { Router } from 'express';
import {
  submitOnboarding,
  updateOnboarding,
  getOnboardingStatus,
} from '../controller/onboardingController.js';

import { checkToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();

// 🔐 Employee-authenticated routes only
router.use(checkToken, checkRole(['employee']));

// POST: Submit onboarding application (first-time or re-submit after rejection)
router.post('/submit', submitOnboarding);

// PUT: Update onboarding form (if rejected)
router.put('/update', updateOnboarding);

// GET: Get current user's onboarding status and details
router.get('/status', getOnboardingStatus); // changed from :userId to /status

export default router;

