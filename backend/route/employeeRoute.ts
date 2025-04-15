import { Router } from 'express';
import {
  getProfile,
  updateProfileSection,
  addEmergencyContact,
  getDocuments,
} from '../controller/employeeController.js';

import { checkToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require the user to be authenticated and have the 'employee' role
router.use(checkToken, checkRole(['employee']));

// GET employee profile
router.get('/:id', getProfile);

// PUT update a section (e.g. name, address, contactInfo)
router.put('/:id/section', updateProfileSection);

// POST add emergency contact
router.post('/:id/emergency', addEmergencyContact);

// GET document list for employee
router.get('/:id/documents', getDocuments);

export default router;