import { Router } from 'express';
import { userProductController } from '../../controllers/user/product.controller.js';

const router = Router();

// GET /api/user/products/featured - Must be before /:id route
router.get('/featured', userProductController.getFeatured);

// GET /api/user/products/category/:categoryId
router.get('/category/:categoryId', userProductController.getByCategory);

// GET /api/user/products
router.get('/', userProductController.getAll);

// GET /api/user/products/:id
router.get('/:id', userProductController.getById);

export default router;
