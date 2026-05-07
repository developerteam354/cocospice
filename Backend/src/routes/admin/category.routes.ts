import { Router } from 'express';
import { categoryController } from '../../controllers/admin/category.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { uploadCategoryImage } from '../../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);

router.get('/',              categoryController.getAll);
router.post('/',             uploadCategoryImage, categoryController.create);
router.put('/:id',           uploadCategoryImage, categoryController.update);
router.patch('/:id/toggle',  categoryController.toggle);
router.delete('/:id',        categoryController.delete);

export default router;
