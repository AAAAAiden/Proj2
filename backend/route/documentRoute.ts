import express from 'express';
import upload from '../util/fileHandler.js';
import {
  uploadDocument,
  downloadDocument,
  previewDocument,
  listDocuments,
  deleteDocument
} from '../controller/documentController.js';
import { checkToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', checkToken, checkRole(['employee']), upload.single('file'), uploadDocument);
router.get('/list/:userId', checkToken, checkRole(['employee', 'hr']), listDocuments);
router.get('/preview/:id', previewDocument);
router.get('/download/:id', downloadDocument);
router.delete('/:id', checkToken, checkRole(['employee']), deleteDocument);

export default router;