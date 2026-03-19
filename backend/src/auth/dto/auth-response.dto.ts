import { UserRole } from 'src/user/types/user.interface';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
    first_name: string;
    last_name: string;
  };
}
