import { Router } from 'express';
import { CategoryController } from './category.controller.js';

const router = Router();

// Public Category Endpoints
router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);

export const categoryRoutes = router;
