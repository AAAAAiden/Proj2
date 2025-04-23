import express from 'express';
import { uploadDocument, downloadDocument, previewDocument, listDocuments } from '../controller/documentController.js';
import { checkToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', checkToken, checkRole(['employee']), uploadDocument);
router.get('/list', checkToken, checkRole(['employee', 'hr']), listDocuments);
router.get('/preview/:docId', checkToken, checkRole(['employee', 'hr']), previewDocument);
router.get('/download/:docId', checkToken, checkRole(['employee', 'hr']), downloadDocument);

export default router;