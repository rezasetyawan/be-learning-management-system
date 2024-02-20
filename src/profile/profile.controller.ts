import {
  Controller,
  Get,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get()
  find(@Req() request: Request) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.profileService.find(accessToken);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.profileService.findByUsername(username);
  }

  @Get(':username/academies')
  getUserAcademies(@Param('username') username: string) {
    return this.profileService.getUserAcademies(username);
  }
}
