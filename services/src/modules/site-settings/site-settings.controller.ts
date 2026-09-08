import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

export class SiteSettingsController {
  // 1. Get current site settings (or default if not yet created)
  static getSettings = asyncHandler(async (_req: Request, res: Response) => {
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          businessName: 'KtmBotanica Nursery & Florist',
          phone: '9800000000',
          email: 'contact@ktmbotanica.com',
          address: 'Lakeside Botanical Row, Pokhara',
          province: 'Bagmati',
          district: 'Kaski',
          city: 'Pokhara',
          area: 'Lakeside',
          latitude: 28.2096,
          longitude: 83.9595,
          openingHours: 'Sun - Sat: 8:00 AM - 7:00 PM',
          defaultDeliveryMessage: 'Standard delivery across Pokhara within 24 hours.',
          setupCompleted: false,
        },
      });
    } else if (settings.city === 'Kathmandu' && settings.address.includes('Lazimpat')) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          address: 'Lakeside Botanical Row, Pokhara',
          district: 'Kaski',
          city: 'Pokhara',
          area: 'Lakeside',
          latitude: 28.2096,
          longitude: 83.9595,
          defaultDeliveryMessage: 'Standard delivery across Pokhara within 24 hours.',
        },
      });
    }

    return res.status(200).json(ApiResponse.success(settings, 'Site settings retrieved successfully'));
  });

  // 2. Update site settings (Admin only)
  static updateSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      businessName,
      logo,
      favicon,
      phone,
      email,
      address,
      province,
      district,
      city,
      area,
      latitude,
      longitude,
      openingHours,
      socialLinks,
      defaultDeliveryMessage,
      setupCompleted,
    } = req.body;

    // Validate phone if provided (10 digits starting with 9)
    if (phone && !/^[9][0-9]{9}$/.test(phone)) {
      throw ApiError.badRequest('Phone number must be exactly 10 digits and start with 9');
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.badRequest('Invalid email address format');
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(businessName && { businessName }),
        ...(logo !== undefined && { logo }),
        ...(favicon !== undefined && { favicon }),
        ...(phone && { phone }),
        ...(email && { email: email.toLowerCase() }),
        ...(address && { address }),
        ...(province !== undefined && { province }),
        ...(district !== undefined && { district }),
        ...(city && { city }),
        ...(area !== undefined && { area }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(openingHours !== undefined && { openingHours }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(defaultDeliveryMessage !== undefined && { defaultDeliveryMessage }),
        ...(setupCompleted !== undefined && { setupCompleted }),
      },
      create: {
        id: 'default',
        businessName: businessName || 'KtmBotanica Nursery & Florist',
        logo,
        favicon,
        phone: phone || '9800000000',
        email: (email || 'contact@ktmbotanica.com').toLowerCase(),
        address: address || 'Lakeside Botanical Row, Pokhara',
        province: province || 'Bagmati',
        district: district || 'Kaski',
        city: city || 'Pokhara',
        area: area || 'Lakeside',
        latitude: latitude || 28.2096,
        longitude: longitude || 83.9595,
        openingHours: openingHours || 'Sun - Sat: 8:00 AM - 7:00 PM',
        socialLinks,
        defaultDeliveryMessage: defaultDeliveryMessage || 'Standard delivery across Pokhara within 24 hours.',
        setupCompleted: setupCompleted || false,
      },
    });

    return res.status(200).json(ApiResponse.success(settings, 'Site settings updated successfully'));
  });

  // 3. Complete Admin Setup Wizard
  static completeSetupWizard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      businessName,
      logo,
      phone,
      email,
      address,
      province,
      district,
      city,
      area,
      latitude,
      longitude,
      openingHours,
    } = req.body;

    if (!businessName || !phone || !email || !address) {
      throw ApiError.badRequest('Business name, phone, email, and address are required to complete setup');
    }

    if (!/^[9][0-9]{9}$/.test(phone)) {
      throw ApiError.badRequest('Phone number must be exactly 10 digits and start with 9');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.badRequest('Invalid email format');
    }

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        businessName,
        logo: logo || null,
        phone,
        email: email.toLowerCase(),
        address,
        province: province || 'Bagmati',
        district: district || 'Kaski',
        city: city || 'Pokhara',
        area: area || '',
        latitude: latitude || 28.2096,
        longitude: longitude || 83.9595,
        openingHours: openingHours || 'Sun - Sat: 8:00 AM - 7:00 PM',
        setupCompleted: true,
      },
      create: {
        id: 'default',
        businessName,
        logo: logo || null,
        phone,
        email: email.toLowerCase(),
        address,
        province: province || 'Bagmati',
        district: district || 'Kaski',
        city: city || 'Pokhara',
        area: area || '',
        latitude: latitude || 28.2096,
        longitude: longitude || 83.9595,
        openingHours: openingHours || 'Sun - Sat: 8:00 AM - 7:00 PM',
        setupCompleted: true,
      },
    });

    return res.status(200).json(ApiResponse.success(updated, 'Admin onboarding setup completed successfully!'));
  });
}
