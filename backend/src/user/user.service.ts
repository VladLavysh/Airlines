import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { IUser } from './types/user.interface';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  async findAll(data: { limit: number; offset: number; order_by?: string; order?: 'asc' | 'desc' }) {
    const users = await this.repo.findAll(data);
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  async getUserById(id: number) {
    const rows = await this.repo.findOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = rows[0];
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findUserByEmail(email: string) {
    const rows = await this.repo.findOneByEmail(email);

    // if (rows.length === 0) {
    //   throw new NotFoundException('User not found');
    // }

    return rows[0];
  }

  async createUser(data: Omit<IUser, 'deleted_at'>) {
    const hashedPassword = await argon2.hash(data.password);
    
    const rows = await this.repo.createOne({
      ...data,
      password: hashedPassword,
    });

    const user = rows[0];
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserById(id: number, data: Partial<Omit<IUser, 'deleted_at'>>) {
    const updateData = { ...data };
    
    if (data.password) {
      updateData.password = await argon2.hash(data.password);
    }

    const rows = await this.repo.updateOneById(id, updateData);

    if (rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = rows[0];
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUserById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
