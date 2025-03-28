import { createContext } from 'react';
import { UserRole } from '../models/UserRole';
import { User } from '../models/User';

export interface UserContextType {
  user: User | null;
  createUser: (role: UserRole) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
