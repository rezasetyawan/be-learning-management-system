import {
  Body,
  Controller,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { Request } from 'express';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';

@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Patch()
  upsert(
    @Req() request: Request,
    @Body() createUserProgressDto: CreateUserProgressDto,
  ) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.userProgressService.upsert(createUserProgressDto, accessToken);
  }
}
