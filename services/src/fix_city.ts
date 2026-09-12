import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log('Total products in database:', products.length);
  for (const p of products) {
    let updated = false;
    let desc = p.description || '';
    let shortDesc = p.shortDescription || '';

    if (desc.includes('Kathmandu') || desc.includes('kathmandu')) {
      desc = desc.replace(/Kathmandu/gi, 'Pokhara');
      updated = true;
    }
    if (shortDesc.includes('Kathmandu') || shortDesc.includes('kathmandu')) {
      shortDesc = shortDesc.replace(/Kathmandu/gi, 'Pokhara');
      updated = true;
    }

    if (updated) {
      console.log('Updated product description from Kathmandu to Pokhara:', p.id, p.name);
      await prisma.product.update({
        where: { id: p.id },
        data: { description: desc, shortDescription: shortDesc }
      });
    }
  }

  // Also check SiteSettings
  const settings = await prisma.siteSettings.findMany();
  for (const s of settings) {
    let sUpdated = false;
    let data: any = {};
    if (s.city && s.city.toLowerCase().includes('kathmandu')) {
      data.city = 'Pokhara';
      sUpdated = true;
    }
    if (s.district && s.district.toLowerCase().includes('kathmandu')) {
      data.district = 'Kaski';
      sUpdated = true;
    }
    if (s.defaultDeliveryMessage && s.defaultDeliveryMessage.toLowerCase().includes('kathmandu')) {
      data.defaultDeliveryMessage = 'Same-day careful delivery across Pokhara valley.';
      sUpdated = true;
    }
    if (sUpdated) {
      console.log('Updated SiteSettings from Kathmandu to Pokhara:', s.id);
      await prisma.siteSettings.update({ where: { id: s.id }, data });
    }
  }
}

main()
  .then(() => console.log('Successfully updated database city references!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
