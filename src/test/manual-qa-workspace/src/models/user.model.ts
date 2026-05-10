export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'member' | 'viewer';

export interface AuthenticatedUser extends User {
  role: UserRole;
}
