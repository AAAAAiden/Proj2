import { Router } from 'express';
import { register, login, checkRegistrationToken } from '../controller/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-token', checkRegistrationToken);

export default router;