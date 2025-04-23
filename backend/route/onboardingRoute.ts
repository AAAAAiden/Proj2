import { Router } from 'express';
import {
  submitOnboarding,
  updateOnboarding,
  getOnboardingStatus,
} from '../controller/onboardingController.js';

import { checkToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(checkToken, checkRole(['employee']));

router.post('/submit', submitOnboarding);

router.put('/update', updateOnboarding);

router.get('/status', getOnboardingStatus); // changed from :userId to /status

export default router;

