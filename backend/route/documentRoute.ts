import { Router } from 'express';
import multer from 'multer';
import {
  uploadDocument,
  listDocuments,
  previewDocument,
  downloadDocument,
} from '../controller/documentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.use(authenticate);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:userId', listDocuments);
router.get('/preview/:id', previewDocument);
router.get('/download/:id', downloadDocument);

export default router;
