import { Router } from 'express';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import addressRoutes from './address.routes.js';
import authRoutes from './auth.routes.js';
import orderRoutes from './order.routes.js';
import profileRoutes from './profile.routes.js';
import uploadRoutes from './upload.routes.js';
import paymentRoutes from './payment.route.js';

const router = Router();

// User routes
router.use('/auth',       authRoutes);
router.use('/products',   productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart',       cartRoutes);
router.use('/addresses',  addressRoutes);
router.use('/orders',     orderRoutes);
router.use('/profile',    profileRoutes);
router.use('/upload',     uploadRoutes);
router.use('/payment',    paymentRoutes);

export default router;
