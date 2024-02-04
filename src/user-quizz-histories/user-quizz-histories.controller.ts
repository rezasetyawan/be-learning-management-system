import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  Req,
  Query,
} from '@nestjs/common';
import { UserQuizzHistoriesService } from './user-quizz-histories.service';
import { CreateUserQuizzHistoryDto } from './dto/create-user-quizz-history.dto';
import { UpdateUserQuizzHistoryDto } from './dto/update-user-quizz-history.dto';
import { Request } from 'express';

@Controller('user-quizz-histories')
export class UserQuizzHistoriesController {
  constructor(
    private readonly userQuizzHistoriesService: UserQuizzHistoriesService,
  ) { }

  @Post()
  create(
    @Body() createUserQuizzHistoryDto: CreateUserQuizzHistoryDto,
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

    return this.userQuizzHistoriesService.create(
      createUserQuizzHistoryDto,
      accessToken,
    );
  }

  @Get()
  findAll(@Query('moduleId') moduleId: string = '', @Req() request: Request) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.userQuizzHistoriesService.findAll(moduleId, accessToken);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.userQuizzHistoriesService.findOne(id, accessToken);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserQuizzHistoryDto: UpdateUserQuizzHistoryDto,
  ) {
    return this.userQuizzHistoriesService.update(
      +id,
      updateUserQuizzHistoryDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userQuizzHistoriesService.remove(+id);
  }
}
