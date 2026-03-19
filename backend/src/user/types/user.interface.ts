export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser {
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  password: string;
  deleted_at?: Date;
}
