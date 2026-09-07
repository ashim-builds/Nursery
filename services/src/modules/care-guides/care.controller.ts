import { Request, Response } from 'express';
import { CareGuideService } from './care.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class CareGuideController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const guides = await CareGuideService.getAll();
    res.status(200).json(ApiResponse.success(guides, 'Care guides retrieved'));
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const guide = await CareGuideService.getBySlug(req.params.slug);
    res.status(200).json(ApiResponse.success(guide, 'Care guide details'));
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const created = await CareGuideService.create(req.body);
    res.status(201).json(ApiResponse.created(created, 'Care guide created'));
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const updated = await CareGuideService.update(req.params.id, req.body);
    res.status(200).json(ApiResponse.success(updated, 'Care guide updated'));
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await CareGuideService.delete(req.params.id);
    res.status(200).json(ApiResponse.success(null, 'Care guide deleted'));
  });
}
