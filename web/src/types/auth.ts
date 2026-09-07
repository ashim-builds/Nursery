export type UserRole = 'CUSTOMER' | 'ADMIN' | 'CARE_EXPERT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  address?: string;
  city?: string;
  avatarUrl?: string;
  createdAt: string;
  _count?: {
    orders: number;
    wishlistItems: number;
    reviews: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
