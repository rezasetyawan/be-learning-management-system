import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Query,
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

  @Get()
  getProgress(@Req() request: Request, @Query('academyId') academyId: string) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!academyId) {
      throw new BadRequestException(
        'Please provided academyId query parameter',
      );
    }

    return this.userProgressService.getProgress(academyId, accessToken);
  }
}
