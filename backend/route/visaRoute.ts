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

router.use(checkToken, checkRole(['employee']));

router.get('/status', getVisaStatus);

router.post('/upload/opt-receipt', upload.single('file'), uploadOPTReceipt);

router.post('/upload/opt-ead', upload.single('file'), uploadOPTEAD);

router.post('/upload/i983', upload.single('file'), uploadI983);

router.post('/upload/i20', upload.single('file'), uploadI20);

router.put('/review', checkToken, checkRole(['hr']), reviewDocument);

export default router;
