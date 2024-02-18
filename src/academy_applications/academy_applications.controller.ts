import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AcademyApplicationsService } from './academy_applications.service';
import { Request } from 'express';
import { CreateAcademyApplicationDto } from './dto/create-academy-application.dto';

@Controller('academy-applications')
export class AcademyApplicationsController {
  constructor(
    private readonly academyApplicationsService: AcademyApplicationsService,
  ) {}

  @Post()
  create(
    @Body() createAcademyApplicationDto: CreateAcademyApplicationDto,
    @Req() request: Request,
  ) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.academyApplicationsService.create(
      createAcademyApplicationDto,
      accessToken,
    );
  }
}