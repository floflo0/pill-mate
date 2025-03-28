import { UserRole } from './UserRole.ts';

export interface User {
  homeAssistantUserId: string;
  userName: string;
  userDisplayName: string;
  role: UserRole;
}
