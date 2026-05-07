import { Router } from 'express';
import { userCategoryController } from '../../controllers/user/category.controller.js';

const router = Router();

// GET /api/user/categories
router.get('/', userCategoryController.getAll);

// GET /api/user/categories/:id
router.get('/:id', userCategoryController.getById);

export default router;
