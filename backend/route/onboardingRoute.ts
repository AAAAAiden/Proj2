import { Router } from 'express';
import {
  submitOnboarding,
  updateOnboarding,
  getOnboardingStatus,
} from '../controller/onboardingController.js';
import { authenticate, authorizeEmployee } from '../middleware/authMiddleware.js';

const router = Router();

// Employee routes
router.use(authenticate, authorizeEmployee);
router.post('/submit', submitOnboarding);
router.put('/update', updateOnboarding);
router.get('/:userId', getOnboardingStatus);

export default router;
