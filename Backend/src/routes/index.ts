import { Router } from 'express';
import adminRouter from './admin/index.js';
import userRouter from './user/index.js';

const router = Router();

// Add logging middleware for debugging
if (process.env.NODE_ENV === 'development') {
  router.use((req, _res, next) => {
    console.log('📍 [MAIN ROUTES] Request:', req.method, req.originalUrl || req.url);
    next();
  });
}

router.use('/admin', adminRouter);
router.use('/user', userRouter);

export default router;
