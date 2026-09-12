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
          businessName: 'RJ Flowers',
          phone: '9815155580',
          whatsappPhone: '9815155580',
          email: 'contact@rjflowers.com',
          address: 'Pokhara-26, Arghau Chowk, Pokhara',
          province: 'Gandaki',
          district: 'Kaski',
          city: 'Pokhara',
          area: 'Arghau Chowk',
          latitude: 28.2365,
          longitude: 84.0036,
          openingHours: 'Every day: 7:00 AM - 7:00 PM (Closed on festivals)',
          defaultDeliveryMessage: 'Delivery across Pokhara. Rs. 100 delivery charge below Rs. 2,000; free delivery at Rs. 2,000 and above.',
          setupCompleted: false,
        },
      });
    } else if (
      settings.phone === '9800000000' || !settings.phone ||
      settings.businessName.includes('KtmBotanica') || settings.businessName.includes('Ktm Botanica') ||
      settings.city === 'Kathmandu' ||
      settings.address.includes('Lazimpat') ||
      settings.address.includes('Lakeside')
    ) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          businessName: 'RJ Flowers',
          phone: '9815155580',
          whatsappPhone: '9815155580',
          address: 'Pokhara-26, Arghau Chowk, Pokhara',
          province: 'Gandaki',
          district: 'Kaski',
          city: 'Pokhara',
          area: 'Arghau Chowk',
          latitude: 28.2365,
          longitude: 84.0036,
          openingHours: 'Every day: 7:00 AM - 7:00 PM (Closed on festivals)',
          defaultDeliveryMessage: 'Delivery across Pokhara. Rs. 100 delivery charge below Rs. 2,000; free delivery at Rs. 2,000 and above.',
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
      whatsappPhone,
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
      freeShippingThreshold,
      deliveryNotice,
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
        ...(whatsappPhone !== undefined && { whatsappPhone }),
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
        ...(freeShippingThreshold !== undefined && { freeShippingThreshold }),
        ...(deliveryNotice !== undefined && { deliveryNotice }),
        ...(defaultDeliveryMessage !== undefined && { defaultDeliveryMessage }),
        ...(setupCompleted !== undefined && { setupCompleted }),
      },
      create: {
        id: 'default',
        businessName: businessName || 'RJ Flowers',
        logo,
        favicon,
        phone: phone || '9815155580',
        whatsappPhone: whatsappPhone || '9815155580',
        email: (email || 'contact@rjflowers.com').toLowerCase(),
        address: address || 'Pokhara-26, Arghau Chowk, Pokhara',
        province: province || 'Gandaki',
        district: district || 'Kaski',
        city: city || 'Pokhara',
        area: area || 'Arghau Chowk',
        latitude: latitude || 28.2365,
        longitude: longitude || 84.0036,
        openingHours: openingHours || 'Every day: 7:00 AM - 7:00 PM (Closed on festivals)',
        socialLinks,
        freeShippingThreshold: freeShippingThreshold || 2000.0,
        deliveryNotice: deliveryNotice || 'Delivery across Pokhara. Rs. 100 below Rs. 2,000; free delivery from Rs. 2,000.',
        defaultDeliveryMessage: defaultDeliveryMessage || 'Delivery across Pokhara. Rs. 100 delivery charge below Rs. 2,000; free delivery at Rs. 2,000 and above.',
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
