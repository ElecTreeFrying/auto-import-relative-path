import { Injectable } from '@angular/core';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private currentUser: UserProfile | null = null;

  setUser(user: UserProfile): void {
    this.currentUser = user;
  }

  getUser(): UserProfile | null {
    return this.currentUser;
  }
}
