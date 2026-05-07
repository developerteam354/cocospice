import { Router } from 'express';
import { productController } from '../../controllers/admin/product.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/',                   productController.getAll);
router.get('/stats',              productController.getStats);
router.get('/:id',                productController.getById);
router.post('/',                  productController.create);
router.patch('/:id',              productController.update);
router.patch('/:id/availability', productController.toggleAvailability);
router.delete('/:id',             productController.delete);

export default router;
