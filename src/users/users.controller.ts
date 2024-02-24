import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Patch,
  Body,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../../src//auth/guard/roles.guard';
import { Roles } from '../../src//roles.decorator';
import { Role } from '../../src//enums/role.enum';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateUserDto } from './dto/create-user.dto';

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

  @Roles(Role.SuperAdmin)
  @Patch(':username/role')
  updateRole(
    @Param('username') username: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(username, updateRoleDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User, Role.SuperAdmin)
  @Get(':username/role')
  getRole(@Param('username') username: string) {
    return this.usersService.getRole(username);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
