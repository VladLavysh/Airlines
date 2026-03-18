import { UserRole } from 'src/user/types/user.interface';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
}
