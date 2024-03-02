import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AcademyApplicationsService } from './academy_applications.service';
import { Request } from 'express';
import { CreateAcademyApplicationDto } from './dto/create-academy-application.dto';
import { UpdateAcademyApplicationDto } from './dto/update-academy-application.dto';

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

  @Get()
  find(
    @Query('academyId') academyId: string | undefined,
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

    if (!academyId) {
      throw new BadRequestException('Please provide academyId query parameter');
    }

    return this.academyApplicationsService.findOne(academyId, accessToken);
  }

  @Get('/all')
  findAll() {
    return this.academyApplicationsService.getAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAcademyApplicationDto: UpdateAcademyApplicationDto,
  ) {
    return this.academyApplicationsService.update(
      id,
      updateAcademyApplicationDto,
    );
  }

  @Get('/joined')
  getJoinedUser(@Query('academyId') academyId: string | undefined) {
    if (!academyId) {
      throw new BadRequestException('Please provide academyId query parameter');
    }

    return this.academyApplicationsService.getAcademyJoinedUser(academyId);
  }
}
