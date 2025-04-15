import { Router } from 'express';
import multer from 'multer';
import {
  getVisaStatus,
  uploadOPTReceipt,
  uploadOPTEAD,
  uploadI983,
  uploadI20,
  reviewDocument,
} from '../controller/visaController.js';

import { checkToken, checkRole } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

/** ─────────────── Employee Routes ─────────────── **/

router.use(checkToken, checkRole(['employee']));

// GET: visa status for current user
router.get('/status', getVisaStatus);

// POST: upload OPT receipt
router.post('/upload/opt-receipt', upload.single('file'), uploadOPTReceipt);

// POST: upload OPT EAD
router.post('/upload/opt-ead', upload.single('file'), uploadOPTEAD);

// POST: upload I-983
router.post('/upload/i983', upload.single('file'), uploadI983);

// POST: upload I-20
router.post('/upload/i20', upload.single('file'), uploadI20);

/** ─────────────── HR Route ─────────────── **/

// HR-only access to review documents
router.put('/review', checkToken, checkRole(['hr']), reviewDocument);

export default router;
