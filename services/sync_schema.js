const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function syncAll() {
  console.log('🔄 Syncing full database schema with MySQL...');
  try {
    const sqlPath = path.resolve(__dirname, 'full_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ full_schema.sql not found at:', sqlPath);
      process.exit(1);
    }

    const rawSql = fs.readFileSync(sqlPath, 'utf-8');
    const statements = rawSql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (err) {
        console.warn(`Statement ${i + 1} notice:`, err.message.split('\n')[0]);
      }
    }

    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    // Seed/Ensure Admin User
    const adminPasswordHash = await bcrypt.hash('Rjflowers@2026!', 10);
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { passwordHash: adminPasswordHash, isActive: true }
      });
      console.log('🔑 Admin password confirmed: Rjflowers@2026!');
    } else {
      await prisma.user.create({
        data: {
          name: 'RJ Flowers Admin',
          email: 'admin@rjflowers.com',
          passwordHash: adminPasswordHash,
          role: 'ADMIN',
          isActive: true
        }
      });
      console.log('🔑 Admin created with password: Rjflowers@2026!');
    }

    console.log('🎉 Database tables and Admin setup completed successfully!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAll();
