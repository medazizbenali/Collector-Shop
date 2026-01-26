export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
}
