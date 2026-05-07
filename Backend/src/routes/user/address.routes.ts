import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../controllers/user/address.controller.js';

const router = Router();

router.get('/',            getAddresses);       // GET    /api/user/addresses?sessionId=xxx
router.post('/',           createAddress);      // POST   /api/user/addresses
router.patch('/:id',       updateAddress);      // PATCH  /api/user/addresses/:id
router.delete('/:id',      deleteAddress);      // DELETE /api/user/addresses/:id?sessionId=xxx
router.patch('/:id/default', setDefaultAddress); // PATCH  /api/user/addresses/:id/default

export default router;
