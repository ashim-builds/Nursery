import { Request, Response } from 'express';
import { DeliveryService } from './delivery.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export class DeliveryController {
  static getZones = asyncHandler(async (req: Request, res: Response) => {
    const onlyActive = req.query.all !== 'true';
    const zones = await DeliveryService.getZones(onlyActive);
    res.status(200).json(ApiResponse.success(zones, 'Delivery zones retrieved successfully'));
  });

  static getZoneById = asyncHandler(async (req: Request, res: Response) => {
    const zone = await DeliveryService.getZoneById(req.params.id);
    res.status(200).json(ApiResponse.success(zone, 'Delivery zone details retrieved'));
  });

  static calculateZone = asyncHandler(async (req: Request, res: Response) => {
    const result = await DeliveryService.determineZone(req.body);
    res.status(200).json(ApiResponse.success(result, 'Delivery calculation determined'));
  });

  static createZone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const zone = await DeliveryService.createZone(req.body);
    res.status(201).json(ApiResponse.created(zone, 'Delivery zone created successfully'));
  });

  static updateZone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const zone = await DeliveryService.updateZone(req.params.id, req.body);
    res.status(200).json(ApiResponse.success(zone, 'Delivery zone updated successfully'));
  });

  static assignRider = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const staffUserId = req.user?.id;
    const delivery = await DeliveryService.assignRider(
      req.params.id,
      req.body.riderName,
      req.body.riderPhone,
      staffUserId
    );
    res.status(200).json(ApiResponse.success(delivery, 'Delivery rider assigned successfully'));
  });

  static updateDeliveryStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const staffUserId = req.user?.id;
    const delivery = await DeliveryService.updateDeliveryStatus(
      req.params.id,
      req.body.status,
      req.body.trackingNotes,
      staffUserId
    );
    res.status(200).json(ApiResponse.success(delivery, 'Delivery status updated successfully'));
  });
}
