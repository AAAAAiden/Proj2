import { Router } from 'express';
import {
  getProfile,
  updateProfileSection,
  addEmergencyContact,
  getDocuments,
} from '../controller/employeeController.js';

import { checkToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(checkToken, checkRole(['employee']));

router.get('/:id', getProfile);

router.put('/:id/section', updateProfileSection);

router.post('/:id/emergency', addEmergencyContact);

router.get('/:id/documents', getDocuments);

export default router;