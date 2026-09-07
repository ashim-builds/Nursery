import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { ProductController } from '../products/product.controller.js';
import { CategoryController } from '../categories/category.controller.js';
import { InventoryController } from '../inventory/inventory.controller.js';
import { OrderController } from '../orders/order.controller.js';
import { authenticateJWT, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../../validators/product.validator.js';
import {
  adjustStockSchema,
  inventoryQuerySchema,
} from '../../validators/inventory.validator.js';
import {
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../../validators/order.validator.js';
import {
  createCouponSchema,
  updateCouponSchema,
  moderateReviewSchema,
  broadcastNotificationSchema,
} from '../../validators/admin.validator.js';
import { UserRole } from '@prisma/client';

const router = Router();

// ==========================================
// 1. DASHBOARD & METRICS
// ==========================================
router.get('/dashboard', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), AdminController.getDashboard);
router.get('/metrics', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), AdminController.getMetrics);

// ==========================================
// 2. ORDERS MANAGEMENT
// ==========================================
router.get('/orders', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), validateRequest(orderQuerySchema), OrderController.getOrders);
router.get('/orders/:id', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), OrderController.getOrderById);
router.patch(
  '/orders/:id/status',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

// ==========================================
// 3. INVENTORY MANAGEMENT
// ==========================================
router.get(
  '/inventory',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(inventoryQuerySchema),
  InventoryController.getInventory
);
router.get(
  '/inventory/transactions',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InventoryController.getTransactions
);
router.get(
  '/inventory/:productId',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InventoryController.getProductInventory
);
router.post(
  '/inventory/adjust',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(adjustStockSchema),
  InventoryController.adjustStock
);

// ==========================================
// 4. CUSTOMERS & PAYMENTS
// ==========================================
router.get('/customers', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), AdminController.getCustomers);
router.get('/payments', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), AdminController.getPayments);

// ==========================================
// 5. COUPONS CRUD
// ==========================================
router.get('/coupons', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), AdminController.getCoupons);
router.post(
  '/coupons',
  authenticateJWT,
  requireRole(UserRole.ADMIN),
  validateRequest(createCouponSchema),
  AdminController.createCoupon
);
router.patch(
  '/coupons/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN),
  validateRequest(updateCouponSchema),
  AdminController.updateCoupon
);
router.delete('/coupons/:id', authenticateJWT, requireRole(UserRole.ADMIN), AdminController.deleteCoupon);

// ==========================================
// 6. REVIEWS MODERATION
// ==========================================
router.get('/reviews', authenticateJWT, requireRole(UserRole.ADMIN, UserRole.STAFF), AdminController.getReviews);
router.patch(
  '/reviews/:id/moderate',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(moderateReviewSchema),
  AdminController.moderateReview
);
router.delete('/reviews/:id', authenticateJWT, requireRole(UserRole.ADMIN), AdminController.deleteReview);

// ==========================================
// 7. NOTIFICATIONS & BROADCAST
// ==========================================
router.post(
  '/notifications/broadcast',
  authenticateJWT,
  requireRole(UserRole.ADMIN),
  validateRequest(broadcastNotificationSchema),
  AdminController.broadcastNotification
);

// ==========================================
// 8. AUDIT LOGS
// ==========================================
router.get('/audit-logs', authenticateJWT, requireRole(UserRole.ADMIN), AdminController.getAuditLogs);

// ==========================================
// 9. CATEGORIES CRUD
// ==========================================
router.post(
  '/categories',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(createCategorySchema),
  CategoryController.create
);
router.patch(
  '/categories/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updateCategorySchema),
  CategoryController.update
);
router.delete('/categories/:id', authenticateJWT, requireRole(UserRole.ADMIN), CategoryController.delete);

// ==========================================
// 10. PRODUCTS & VARIANTS CRUD
// ==========================================
router.post(
  '/products',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(createProductSchema),
  ProductController.createProduct
);
router.patch(
  '/products/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);
router.delete('/products/:id', authenticateJWT, requireRole(UserRole.ADMIN), ProductController.deleteProduct);

router.post(
  '/products/:id/variants',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(createVariantSchema),
  ProductController.createVariant
);
router.patch(
  '/variants/:id',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validateRequest(updateVariantSchema),
  ProductController.updateVariant
);
router.delete('/variants/:id', authenticateJWT, requireRole(UserRole.ADMIN), ProductController.deleteVariant);

// ==========================================
// 11. PRODUCT IMAGES CRUD
// ==========================================
router.post(
  '/products/:id/images',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  ProductController.addImage
);
router.delete(
  '/products/:id/images/:imageId',
  authenticateJWT,
  requireRole(UserRole.ADMIN),
  ProductController.deleteImage
);
router.patch(
  '/products/:id/images/:imageId/primary',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  ProductController.setPrimaryImage
);
router.put(
  '/products/:id/images/reorder',
  authenticateJWT,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  ProductController.reorderImages
);

export const adminRoutes = router;
