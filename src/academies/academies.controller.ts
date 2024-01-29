import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
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
import { Express, Request } from 'express';
import { CreateModuleGroupDto } from './dto/create-module-group.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateQuizzDto } from './dto/quizz/create-quizz-dto';
import { CreateQuizzQuestionDto } from './dto/quizz-question/create-quizz-question.dto';
import { CreateQuestionAnswerDto } from './dto/quizz-question-answer/create-question-answer.dto';
import UpdateQuestionAnswerDto from './dto/quizz-question-answer/update-question-answer.dto';
import UpdateQuizzDto from './dto/quizz/update-quizz.dto';
import { UpdateQuizzQuestionDto } from './dto/quizz-question/update-quzz-question.dto';

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

  @Get(':id/continue')
  getUserLastReadModule(@Param('id') id: string, @Req() request: Request) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.academiesService.getUserLastReadModule(id, accessToken);
  }

  // MODULE GROUP
  @Post(':academyId/module-groups')
  addModuleGroup(@Body() createModuleGroupDto: CreateModuleGroupDto) {
    return this.academiesService.addModuleGroup(createModuleGroupDto);
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

  @Get(':academyId/module-groups')
  getModuleGroups(
    @Param('academyId') academyId: string,
    @Query('isDeleted') isDeleted: boolean = false,
  ) {
    return this.academiesService.getModuleGroups(academyId, isDeleted);
  }

  // MODULES
  @Get(':academyId/modules')
  getModules(
    @Param('academyId') academyId: string,
    @Query('isDeleted') isDeleted: boolean = false,
  ) {
    return this.academiesService.getModules(academyId, isDeleted);
  }

  @Get(':academyId/module-groups/:moduleGroupId/modules/:moduleId')
  getModule(
    @Param('academyId') academyId: string,
    @Param('moduleGroupId') moduleGroupId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.academiesService.getModule(academyId, moduleGroupId, moduleId);
  }

  @Post(':academyId/module-groups/:moduleGroupId/modules')
  addModule(@Body() createModuleDto: CreateModuleDto) {
    return this.academiesService.addModule(createModuleDto);
  }

  @Post(':academyId/module-groups/:moduleGroupId/modules/:moduleId/images')
  @UseInterceptors(FileInterceptor('modulePicture'))
  addImage(
    @Param('moduleId') moduleId: string,
    @UploadedFile()
    modulePicture?: Express.Multer.File,
  ) {
    return this.academiesService.addModulePicture(moduleId, modulePicture);
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

  // QUIZZES
  @Post('modules/:moduleId/quizz')
  createQuizz(
    @Param('moduleId') moduleId: string,
    @Body() createQuizzDto: CreateQuizzDto,
  ) {
    return this.academiesService.createQuizz(moduleId, createQuizzDto);
  }

  @Patch('modules/:moduleId/quizz')
  updateQuizz(
    @Param('moduleId') moduleId: string,
    @Body() updateQuizzDto: UpdateQuizzDto,
  ) {
    return this.academiesService.updateQuizz(moduleId, updateQuizzDto);
  }

  // QUESTIONS
  // @Get('/modules/:moduleId/quizz/:quizzId/questions')
  // getQuestions(
  //   @Param('moduleId') moduleId: string,
  //   @Param('quizzId') quizzId: string,
  // ) {}

  @Post('/modules/:moduleId/quizz/:quizzId/questions')
  createQuestion(
    @Param('moduleId') moduleId: string,
    @Param('quizzId') quizzId: string,
    @Body() createQuizzQuestionDto: CreateQuizzQuestionDto,
  ) {
    return this.academiesService.createQuizzQuestion(
      moduleId,
      quizzId,
      createQuizzQuestionDto,
    );
  }

  @Patch('/modules/:moduleId/quizz/:quizzId/questions/:questionId')
  updateQuestion(
    @Param('moduleId') moduleId: string,
    @Param('quizzId') quizzId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuizzQuestionDto: UpdateQuizzQuestionDto,
  ) {
    return this.academiesService.updateQuizzQuestion(
      moduleId,
      quizzId,
      questionId,
      updateQuizzQuestionDto,
    );
  }

  // ANSWER CHOICES
  @Post('/modules/:moduleId/quizz/:quizzId/questions/:questionId')
  createAnswerChoice(
    @Param('moduleId') moduleId: string,
    @Param('quizzId') quizzId: string,
    @Param('questionId') questionId: string,
    @Body() createQuestionAnswerDto: CreateQuestionAnswerDto[],
  ) {
    return this.academiesService.createQuestionAnswer(
      moduleId,
      quizzId,
      questionId,
      createQuestionAnswerDto,
    );
  }

  @Patch(
    '/modules/:moduleId/quizz/:quizzId/questions/:questionId/answers/:answerId',
  )
  updateAnswerChoice(
    @Param('moduleId') moduleId: string,
    @Param('quizzId') quizzId: string,
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
    @Body() updateQuestionAnswerDto: UpdateQuestionAnswerDto,
  ) {
    return this.academiesService.updateQuestionAnswer(
      moduleId,
      quizzId,
      questionId,
      answerId,
      updateQuestionAnswerDto,
    );
  }
}
