import { Router } from 'express';
import { checkToken, checkRole } from '../middleware/authMiddleware.js';

// Employee controller
import {
  getProfile as getEmployeeById,
} from '../controller/employeeController.js';

// Visa controller
import {
  reviewDocument,
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

// HR-only routes
router.use(checkToken, checkRole(['hr']));

/** ─────────────── HR Employee Profile Management ─────────────── */

// GET: view full employee profile
router.get('/employees/:id', getEmployeeById);

/** ─────────────── HR Visa Status Management ─────────────── */

// PUT: approve or reject a visa document
router.put('/visas/review', reviewDocument);

/** ─────────────── HR Hiring & Onboarding ─────────────── */

// POST: generate onboarding token + send email
router.post('/hiring/token', generateRegistrationToken);
router.get('/hiring/token', listRegistrationTokens);

// GET: list onboarding apps by status
router.get('/hiring/applications/:status', listApplicationsByStatus);

// GET: view a single application
router.get('/hiring/application/:userId', viewApplication);

// PUT: approve onboarding
router.put('/hiring/application/approve', approveOnboarding);

// PUT: reject onboarding with feedback
router.put('/hiring/application/reject', rejectOnboarding);

export default router;
