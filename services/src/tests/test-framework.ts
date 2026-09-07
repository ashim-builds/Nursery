export class Assertions {
  private actual: any;

  constructor(actual: any) {
    this.actual = actual;
  }

  toBe(expected: any, message?: string) {
    if (this.actual !== expected) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(this.actual)}`);
    }
  }

  toEqual(expected: any, message?: string) {
    const a = JSON.stringify(this.actual);
    const b = JSON.stringify(expected);
    if (a !== b) {
      throw new Error(message || `Expected ${b}, but got ${a}`);
    }
  }

  toBeTruthy(message?: string) {
    if (!this.actual) {
      throw new Error(message || `Expected truthy, but got ${JSON.stringify(this.actual)}`);
    }
  }

  toBeFalsy(message?: string) {
    if (this.actual) {
      throw new Error(message || `Expected falsy, but got ${JSON.stringify(this.actual)}`);
    }
  }

  toBeGreaterThan(expected: number, message?: string) {
    if (typeof this.actual !== 'number' || this.actual <= expected) {
      throw new Error(message || `Expected ${this.actual} to be greater than ${expected}`);
    }
  }

  toBeGreaterThanOrEqual(expected: number, message?: string) {
    if (typeof this.actual !== 'number' || this.actual < expected) {
      throw new Error(message || `Expected ${this.actual} to be >= ${expected}`);
    }
  }

  toBeLessThan(expected: number, message?: string) {
    if (typeof this.actual !== 'number' || this.actual >= expected) {
      throw new Error(message || `Expected ${this.actual} to be less than ${expected}`);
    }
  }

  toContain(expectedSubstringOrItem: any, message?: string) {
    if (typeof this.actual === 'string') {
      if (!this.actual.includes(expectedSubstringOrItem)) {
        throw new Error(message || `Expected "${this.actual}" to contain "${expectedSubstringOrItem}"`);
      }
    } else if (Array.isArray(this.actual)) {
      if (!this.actual.includes(expectedSubstringOrItem)) {
        throw new Error(message || `Expected array to contain item`);
      }
    } else {
      throw new Error(`Cannot call toContain on type ${typeof this.actual}`);
    }
  }

  toThrow(expectedMessageSubstr?: string) {
    if (typeof this.actual !== 'function') {
      throw new Error('Expected a function to test for throws');
    }
    let threw = false;
    let thrownErr: any;
    try {
      this.actual();
    } catch (err: any) {
      threw = true;
      thrownErr = err;
    }
    if (!threw) {
      throw new Error('Expected function to throw, but it did not');
    }
    if (expectedMessageSubstr && !thrownErr.message?.includes(expectedMessageSubstr)) {
      throw new Error(`Expected throw message to contain "${expectedMessageSubstr}", but got "${thrownErr.message}"`);
    }
  }
}

export function expect(actual: any) {
  return new Assertions(actual);
}

interface TestCase {
  name: string;
  fn: () => Promise<void> | void;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeAllFns: (() => Promise<void> | void)[];
  afterAllFns: (() => Promise<void> | void)[];
}

export class TestRunner {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  describe(name: string, fn: () => void) {
    const suite: TestSuite = {
      name,
      tests: [],
      beforeAllFns: [],
      afterAllFns: [],
    };
    this.suites.push(suite);
    this.currentSuite = suite;
    fn();
    this.currentSuite = null;
  }

  it(name: string, fn: () => Promise<void> | void) {
    if (!this.currentSuite) {
      throw new Error('it() must be called inside describe()');
    }
    this.currentSuite.tests.push({ name, fn });
  }

  beforeAll(fn: () => Promise<void> | void) {
    if (this.currentSuite) {
      this.currentSuite.beforeAllFns.push(fn);
    }
  }

  afterAll(fn: () => Promise<void> | void) {
    if (this.currentSuite) {
      this.currentSuite.afterAllFns.push(fn);
    }
  }

  async run(): Promise<{ total: number; passed: number; failed: number }> {
    let passed = 0;
    let failed = 0;
    let total = 0;

    console.log('\n========================================================');
    console.log('🧪 KtmBotanica Test Suite Runner');
    console.log('========================================================\n');

    for (const suite of this.suites) {
      console.log(`\n📦 ${suite.name}`);

      for (const beforeFn of suite.beforeAllFns) {
        await beforeFn();
      }

      for (const test of suite.tests) {
        total++;
        const startTime = Date.now();
        try {
          await test.fn();
          const duration = Date.now() - startTime;
          console.log(`  ✅ PASS: ${test.name} (${duration}ms)`);
          passed++;
        } catch (error: any) {
          const duration = Date.now() - startTime;
          console.error(`  ❌ FAIL: ${test.name} (${duration}ms)`);
          console.error(`     Error: ${error.message}`);
          failed++;
        }
      }

      for (const afterFn of suite.afterAllFns) {
        await afterFn();
      }
    }

    console.log('\n--------------------------------------------------------');
    console.log(`Summary: ${passed} passed, ${failed} failed, ${total} total`);
    console.log('--------------------------------------------------------\n');

    return { total, passed, failed };
  }
}

export const runner = new TestRunner();
export const describe = runner.describe.bind(runner);
export const it = runner.it.bind(runner);
export const beforeAll = runner.beforeAll.bind(runner);
export const afterAll = runner.afterAll.bind(runner);
