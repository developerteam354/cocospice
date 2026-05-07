import { Router } from 'express';
import adminRouter from './admin/index.js';
import userRouter from './user/index.js';

const router = Router();

router.use('/admin', adminRouter);
router.use('/user', userRouter);

export default router;
