import { runner } from './test-framework.js';
import { registerAuthTests } from './auth.test.js';
import { registerProductTests } from './products.test.js';
import { registerInventoryTests } from './inventory.test.js';
import { registerCartTests } from './cart.test.js';
import { registerCheckoutTests } from './checkout.test.js';
import { registerConcurrencyTests } from './concurrency.test.js';
import { registerOrderTests } from './orders.test.js';
import { registerPaymentTests } from './payments.test.js';
import { prisma } from '../config/database.js';

async function main() {
  try {
    // Register all test suites
    registerAuthTests();
    registerProductTests();
    registerInventoryTests();
    registerCartTests();
    registerCheckoutTests();
    registerConcurrencyTests();
    registerOrderTests();
    registerPaymentTests();

    // Execute suite runner
    const result = await runner.run();

    if (result.failed > 0) {
      console.error(`💥 ${result.failed} test(s) failed!`);
      process.exit(1);
    } else {
      console.log(`🎉 ALL ${result.passed} BACKEND TESTS PASSED SUCCESSFULLY!`);
      process.exit(0);
    }
  } catch (error: any) {
    console.error('Fatal error during test execution:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
