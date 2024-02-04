import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { ModuleDiscussionsService } from './module-discussions.service';
import { CreateModuleDiscussionDto } from './dto/create-module-discussion.dto';
import { UpdateModuleDiscussionDto } from './dto/update-module-discussion.dto';
import { Request } from 'express';

@Controller('module-discussions')
export class ModuleDiscussionsController {
  constructor(
    private readonly moduleDiscussionsService: ModuleDiscussionsService,
  ) {}

  @Post()
  create(
    @Body() createModuleDiscussionDto: CreateModuleDiscussionDto,
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
    return this.moduleDiscussionsService.create(
      createModuleDiscussionDto,
      accessToken,
    );
  }

  @Get()
  findAll(
    @Query('moduleId') moduleId: string | undefined,
    @Query('academyId') academyId: string,
  ) {
    return this.moduleDiscussionsService.findAll(moduleId, academyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleDiscussionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateModuleDiscussionDto: UpdateModuleDiscussionDto,
  ) {
    return this.moduleDiscussionsService.update(+id, updateModuleDiscussionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleDiscussionsService.remove(+id);
  }
}
