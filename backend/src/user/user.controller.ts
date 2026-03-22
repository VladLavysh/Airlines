import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  ParseIntPipe,
  Body,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './types/user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-user.interface';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  // Self-service routes
  @Get('me')
  getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getUserById(user.id);
  }
 
  @Patch('me')
  updateCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PatchUserDto,
  ) {
    return this.userService.updateUserById(user.id, body);
  }
 
  @Delete('me')
  deleteCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.deleteUserById(user.id);
  }

  // Admin-only routes
  @Roles(UserRole.ADMIN)
  @Get()
  getAllUsers(
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('offset', ParseIntPipe) offset: number = 0,
    @Query('order_by') order_by?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.userService.findAll({ limit, offset, order_by, order });
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchUserDto,
  ) {
    return this.userService.updateUserById(id, body);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUserById(id);
  }
}
