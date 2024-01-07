import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AcademiesService } from './academies.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UpdateModuleGroupDto } from './dto/update-module-group.dto';
import { CreateAcademyDto } from './dto/create-academy.dto';

import { UpdateAcademyDto } from './dto/update-academy.dto';
import { FileInterceptor } from '@nestjs/platform-express';
// import { UpdateAcademyDto } from './dto/update-academy.dto';
import { Express } from 'express';

@Controller('academies')
export class AcademiesController {
  constructor(private readonly academiesService: AcademiesService) {}

  // @UseGuards(RolesGuard)
  // @Roles(Role.Admin)
  @Post()
  create(@Body() createAcademyDto: CreateAcademyDto) {
    return this.academiesService.create(createAcademyDto);
  }

  @Patch(':academyId')
  @UseInterceptors(FileInterceptor('academyCoverPicture'))
  updateAcademy(
    @Param('academyId') academyId: string,
    @Body() updateAcademyDto: UpdateAcademyDto,
    @UploadedFile()
    academyCoverPicture?: Express.Multer.File,
  ) {
    return this.academiesService.updateAcademy(
      academyId,
      updateAcademyDto,
      academyCoverPicture,
    );
  }

  @Get()
  findAll() {
    return this.academiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academiesService.findOne(id);
  }

  @Patch(':academyId/module-groups/:moduleGroupId')
  updateModuleGroup(
    @Param('academyId') academyId: string,
    @Param('moduleGroupId') moduleGroupId: string,
    @Body() updateModuleGroupDto: UpdateModuleGroupDto,
  ) {
    return this.academiesService.updateModuleGroup(
      academyId,
      moduleGroupId,
      updateModuleGroupDto,
    );
  }

  @Patch(':academyId/module-groups/:moduleGroupId/modules/:moduleId')
  updateModule(
    @Param('academyId') academyId: string,
    @Param('moduleGroupId') moduleGroupId: string,
    @Param('moduleId') moduleId: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.academiesService.updateModule(
      academyId,
      moduleGroupId,
      moduleId,
      updateModuleDto,
    );
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.academiesService.remove(+id);
  // }
}
