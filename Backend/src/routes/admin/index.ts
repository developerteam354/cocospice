import { Router } from 'express';
import authRoutes     from './auth.routes.js';
import productRoutes  from './product.routes.js';
import uploadRoutes   from './upload.routes.js';
import categoryRoutes from './category.routes.js';
import profileRoutes  from './profile.routes.js';
import orderRoutes    from './order.routes.js';
import userRoutes     from './user.routes.js';

const adminRouter = Router();

adminRouter.use('/auth',       authRoutes);
adminRouter.use('/products',   productRoutes);
adminRouter.use('/upload',     uploadRoutes);
adminRouter.use('/categories', categoryRoutes);
adminRouter.use('/profile',    profileRoutes);
adminRouter.use('/orders',     orderRoutes);
adminRouter.use('/users',      userRoutes);

export default adminRouter;
