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

router.get('/visa-status/:userId', getVisaStatus);

router.post('/visa-status/upload/optReceipt', upload.single('file'), uploadOPTReceipt);

router.post('/visa-status/upload/optEad', upload.single('file'), uploadOPTEAD);

router.post('/visa-status/upload/i983', upload.single('file'), uploadI983);

router.post('/visa-status/upload/i20', upload.single('file'), uploadI20);

export default router;
