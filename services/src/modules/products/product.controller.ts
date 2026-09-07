import { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export class ProductController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProductService.getAll(req.query as any);
    res.status(200).json(ApiResponse.success(result.products, 'Products retrieved', 200, result.meta));
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductService.getBySlug(req.params.slug);
    res.status(200).json(ApiResponse.success(product, 'Product details retrieved'));
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductService.getById(req.params.id);
    res.status(200).json(ApiResponse.success(product, 'Product details retrieved'));
  });

  // Admin Endpoints
  static createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const product = await ProductService.createProduct(req.body, userId);
    res.status(201).json(ApiResponse.created(product, 'Product created successfully'));
  });

  static updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const product = await ProductService.updateProduct(req.params.id, req.body, userId);
    res.status(200).json(ApiResponse.success(product, 'Product updated successfully'));
  });

  static deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const result = await ProductService.deleteProduct(req.params.id, userId);
    res.status(200).json(ApiResponse.success(result, 'Product deleted'));
  });

  static createVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const variant = await ProductService.createVariant(req.params.id, req.body, userId);
    res.status(201).json(ApiResponse.created(variant, 'Variant added successfully'));
  });

  static updateVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const variant = await ProductService.updateVariant(req.params.id, req.body, userId);
    res.status(200).json(ApiResponse.success(variant, 'Variant updated successfully'));
  });

  static deleteVariant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const result = await ProductService.deleteVariant(req.params.id, userId);
    res.status(200).json(ApiResponse.success(result, 'Variant deleted'));
  });

  // Product Image Management
  static addImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const image = await ProductService.addProductImage(req.params.id, req.body, userId);
    res.status(201).json(ApiResponse.created(image, 'Product image added successfully'));
  });

  static deleteImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const result = await ProductService.deleteProductImage(req.params.id, req.params.imageId, userId);
    res.status(200).json(ApiResponse.success(result, 'Product image deleted'));
  });

  static setPrimaryImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const image = await ProductService.setPrimaryImage(req.params.id, req.params.imageId, userId);
    res.status(200).json(ApiResponse.success(image, 'Primary image updated'));
  });

  static reorderImages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const images = await ProductService.reorderProductImages(req.params.id, req.body.images || req.body, userId);
    res.status(200).json(ApiResponse.success(images, 'Product images reordered'));
  });
}
