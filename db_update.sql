-- ==============================================================================
-- RJ Flowers - MySQL Standard Compatible Migration Script
-- Compatible with all MySQL (5.7, 8.0+) & MariaDB versions on cPanel phpMyAdmin
-- ==============================================================================

-- 1. Site Settings Updates
ALTER TABLE `site_settings`
  ADD `whatsappPhone` VARCHAR(191) NULL DEFAULT '9815155580' AFTER `phone`,
  ADD `freeShippingThreshold` DECIMAL(10, 2) NULL DEFAULT 2000.00 AFTER `socialLinks`,
  ADD `deliveryNotice` TEXT NULL AFTER `freeShippingThreshold`;

-- 2. Product Images Metadata Updates
ALTER TABLE `product_images`
  ADD `width` INT NULL AFTER `fileSize`,
  ADD `height` INT NULL AFTER `width`,
  MODIFY `storagePath` VARCHAR(191) NOT NULL DEFAULT 'uploads/products',
  MODIFY `mimeType` VARCHAR(191) NULL DEFAULT 'image/webp';

-- 3. Image Assets Table (Filesystem Image Metadata - Zero BLOBs)
CREATE TABLE IF NOT EXISTS `image_assets` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL DEFAULT 'uploads',
    `url` LONGTEXT NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSize` INT NOT NULL,
    `width` INT NULL,
    `height` INT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `image_assets_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Set Default Store Details for Pokhara
UPDATE `site_settings`
SET
  `businessName` = 'RJ Flowers',
  `city` = 'Pokhara',
  `district` = 'Kaski',
  `province` = 'Gandaki',
  `address` = 'Pokhara-26, Arghau Chowk, Pokhara',
  `phone` = '9815155580',
  `whatsappPhone` = '9815155580',
  `defaultDeliveryMessage` = 'Same-day careful delivery across Pokhara valley.'
WHERE `id` = 'default';
