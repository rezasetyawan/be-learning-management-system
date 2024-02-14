import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User, Role.SuperAdmin)
  @Get(':username/role')
  getRole(@Param('username') username: string) {
    return this.usersService.getRole(username);
  }
}
