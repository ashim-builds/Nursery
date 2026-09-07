import { Router } from 'express';
import { WishlistController } from './wishlist.controller.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { wishlistParamSchema } from '../../validators/cart.validator.js';

const router = Router();

router.get('/', authenticateJWT, WishlistController.getWishlist);
router.post('/toggle/:productId', authenticateJWT, validateRequest(wishlistParamSchema), WishlistController.toggleWishlist);
router.post('/:productId', authenticateJWT, validateRequest(wishlistParamSchema), WishlistController.addToWishlist);
router.delete('/:productId', authenticateJWT, validateRequest(wishlistParamSchema), WishlistController.removeFromWishlist);

export const wishlistRoutes = router;
