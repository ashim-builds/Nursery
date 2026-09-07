import { Request, Response } from 'express';
import { InventoryService } from './inventory.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export class InventoryController {
  static getInventory = asyncHandler(async (req: Request, res: Response) => {
    const result = await InventoryService.getInventoryList(req.query as any);
    res.status(200).json(ApiResponse.success(result.items, 'Inventory list retrieved', 200, result.meta));
  });

  static getProductInventory = asyncHandler(async (req: Request, res: Response) => {
    const result = await InventoryService.getProductInventory(req.params.productId);
    res.status(200).json(ApiResponse.success(result, 'Product inventory retrieved'));
  });

  static adjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const result = await InventoryService.adjustStock({
      ...req.body,
      userId,
    });
    res.status(200).json(ApiResponse.success(result, 'Stock adjusted successfully'));
  });

  static getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const transactions = await InventoryService.getTransactions(req.query as any);
    res.status(200).json(ApiResponse.success(transactions, 'Inventory transaction history retrieved'));
  });

  // Legacy low-stock endpoint backward compatibility
  static getLowStock = asyncHandler(async (req: Request, res: Response) => {
    const result = await InventoryService.getInventoryList({ lowStockOnly: 'true' });
    res.status(200).json(ApiResponse.success(result.items, 'Low stock items retrieved', 200, result.meta));
  });

  static getLogs = asyncHandler(async (req: Request, res: Response) => {
    const logs = await InventoryService.getTransactions(req.query as any);
    res.status(200).json(ApiResponse.success(logs, 'Inventory history logs retrieved'));
  });
}
