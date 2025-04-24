import { Router } from 'express';
import { checkToken, checkRole } from '../middleware/authMiddleware.js';

// Employee controller
import {
  getProfile as getEmployeeById, getAllEmployees
} from '../controller/employeeController.js';

// Visa controller
import {
  reviewDocument, getVisaSummary, getVisaStatus
} from '../controller/visaController.js';

// Onboarding controller
import {
  listApplicationsByStatus,
  viewApplication,
  approveOnboarding,
  rejectOnboarding,
  generateRegistrationToken,
  listRegistrationTokens
} from '../controller/onboardingController.js';

const router = Router();

router.use(checkToken, checkRole(['hr']));

router.get('/employees', getAllEmployees);

router.get('/employees/:id', getEmployeeById);

router.put('/visas/review', reviewDocument);

router.post('/hiring/token', generateRegistrationToken);

router.get('/hiring/token', listRegistrationTokens);

router.get('/visa-summary', getVisaSummary);

router.get('/visa-status/:userId', getVisaStatus);

router.put('/visa-status/review', reviewDocument);

router.get('/hiring/applications/:status', listApplicationsByStatus);

router.get('/hiring/application/:userId', viewApplication);

router.put('/hiring/application/approve', approveOnboarding);

router.put('/hiring/application/reject', rejectOnboarding);

export default router;
