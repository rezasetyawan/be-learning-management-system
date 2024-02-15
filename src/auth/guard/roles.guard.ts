import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../src/enums/role.enum';
import { ROLES_KEY } from '../../../src/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { authorization } = context.switchToHttp().getRequest().headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(accessToken);

    const { role } = await this.usersService.getRole(data.username);

    return requiredRoles.some((requiredRole) => role === requiredRole);
  }
}
