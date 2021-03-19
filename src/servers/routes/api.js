import express from 'express';
import * as authController from '../../controllers/auth';
import { auth as authMiddleware } from '../../middlewares';

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);

router.use(authMiddleware);

export default router;
