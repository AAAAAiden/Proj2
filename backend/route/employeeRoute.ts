import { Router } from 'express';
import {
  getProfile,
  updateProfileSection,
  addEmergencyContact,
  getDocuments,
} from '../controller/employeeController.js';

import { authenticate, authorizeEmployee } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate, authorizeEmployee);

// GET employee profile
router.get('/:id', getProfile);

// PUT update a section (e.g. name, address, contactInfo)
router.put('/:id/section', updateProfileSection);

// POST add emergency contact
router.post('/:id/emergency', addEmergencyContact);

// GET document list for employee
router.get('/:id/documents', getDocuments);

export default router;
