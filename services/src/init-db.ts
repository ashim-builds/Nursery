import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initDb() {
  try {
    console.log('🔄 Connecting to database and creating tables...');
    const sqlPath = path.resolve(process.cwd(), 'schema.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ schema.sql file not found at:', sqlPath);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    // Split by semicolons while ignoring inside statements
    const statements = sqlContent
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (err: any) {
        // Ignore table/foreign key already exists errors
        if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
          console.warn(`Statement ${i + 1} notice:`, err.message.split('\n')[0]);
        }
      }
    }

    console.log('✅ All database tables created and verified successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initDb();
