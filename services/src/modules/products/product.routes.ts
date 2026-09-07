import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { productQuerySchema } from '../../validators/product.validator.js';

const router = Router();

// Public Catalog Endpoints
router.get('/', validateRequest(productQuerySchema), ProductController.getAll);
router.get('/slug/:slug', ProductController.getBySlug);
router.get('/:id', ProductController.getById);

export const productRoutes = router;
