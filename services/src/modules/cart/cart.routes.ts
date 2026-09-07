import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { optionalAuth, authenticateJWT } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
  mergeCartSchema,
} from '../../validators/cart.validator.js';

const router = Router();

router.get('/', optionalAuth, CartController.getCart);
router.post('/items', optionalAuth, validateRequest(addToCartSchema), CartController.addItem);
router.patch('/items/:id', optionalAuth, validateRequest(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:id', optionalAuth, validateRequest(deleteCartItemSchema), CartController.removeItem);
router.delete('/', optionalAuth, CartController.clearCart);
router.post('/merge', authenticateJWT, validateRequest(mergeCartSchema), CartController.mergeCart);

export const cartRoutes = router;
