import { Request, Response } from 'express';
import { CategoryService } from './category.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class CategoryController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoryService.getAll();
    res.status(200).json(ApiResponse.success(categories, 'Categories retrieved'));
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.getBySlug(req.params.slug);
    res.status(200).json(ApiResponse.success(category, 'Category details'));
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const created = await CategoryService.create(req.body);
    res.status(201).json(ApiResponse.created(created, 'Category created'));
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const updated = await CategoryService.update(req.params.id, req.body);
    res.status(200).json(ApiResponse.success(updated, 'Category updated'));
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await CategoryService.delete(req.params.id);
    res.status(200).json(ApiResponse.success(null, 'Category deleted'));
  });
}
