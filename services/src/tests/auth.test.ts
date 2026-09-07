import { describe, it, expect } from './test-framework.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { prisma } from '../config/database.js';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export function registerAuthTests() {
  describe('Authentication & RBAC Tests', () => {
    const testEmail = `botanist_${Date.now()}@ktmtest.com`;
    const testPassword = 'Password123!';
    let registeredUserId: string;

    it('1. Should successfully register a new customer', async () => {
      const result = await AuthService.register({
        fullName: 'Aarav Sharma',
        email: testEmail,
        password: testPassword,
        phoneNumber: '9841000001',
        city: 'Kathmandu',
      });

      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe(testEmail);
      expect(result.user.role).toBe(UserRole.CUSTOMER);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      registeredUserId = result.user.id;
    });

    it('2. Password should be securely hashed with bcrypt (never plaintext)', async () => {
      const userInDb = await prisma.user.findUnique({ where: { id: registeredUserId } });
      expect(userInDb).toBeTruthy();
      expect(userInDb!.passwordHash.startsWith('$2')).toBeTruthy();
      const isMatch = await bcrypt.compare(testPassword, userInDb!.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('3. Should prevent duplicate user registration with same email', async () => {
      let threw = false;
      try {
        await AuthService.register({
          fullName: 'Aarav Duplicate',
          email: testEmail,
          password: testPassword,
        });
      } catch (err: any) {
        threw = true;
        expect(err.statusCode).toBe(409);
      }
      expect(threw).toBe(true);
    });

    it('4. Should successfully log in with valid credentials', async () => {
      const result = await AuthService.login(testEmail, testPassword);

      expect(result.user.email).toBe(testEmail);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('5. Should reject login with invalid password (401)', async () => {
      let threw = false;
      try {
        await AuthService.login(testEmail, 'WrongPassword999!');
      } catch (err: any) {
        threw = true;
        expect(err.statusCode).toBe(401);
      }
      expect(threw).toBe(true);
    });

    it('6. Should store refresh tokens in database and allow token refresh', async () => {
      const loginRes = await AuthService.login(testEmail, testPassword);

      const refreshRes = await AuthService.refreshToken(loginRes.refreshToken);
      expect(refreshRes.accessToken).toBeTruthy();
      expect(refreshRes.refreshToken).toBeTruthy();
    });
  });
}
