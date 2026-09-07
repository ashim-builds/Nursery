import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import { authenticateJWT, optionalAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public: Get reviews for product
router.get('/products/:productId', ReviewController.getProductReviews);
router.get('/product/:productId', ReviewController.getProductReviews);

// Customer Eligibility Check
router.get('/can-review/:productId', optionalAuth, ReviewController.canUserReview);

// Customer Actions (Must be authenticated)
router.post('/', authenticateJWT, ReviewController.create);
router.patch('/:id', authenticateJWT, ReviewController.updateReview);
router.delete('/:id', authenticateJWT, ReviewController.deleteReview);

export const reviewRoutes = router;
