import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  @Put()
  @UseInterceptors(FileInterceptor('profile-image'))
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() request: Request,
    @UploadedFile()
    profileImage?: Express.Multer.File,
  ) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.profileService.updateProfile(
      accessToken,
      updateProfileDto,
      profileImage,
    );
  }
}
