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
import { CreateDiscussionReplyDto } from './dto/create-dicussion-reply.dto';
import { UpdateDiscussionReplyDto } from './dto/update-discussion-reply.dto';

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
    @Query('search') search: string | undefined,
  ) {
    return this.moduleDiscussionsService.findAll(moduleId, academyId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleDiscussionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateModuleDiscussionDto: UpdateModuleDiscussionDto,
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
    return this.moduleDiscussionsService.update(
      id,
      updateModuleDiscussionDto,
      accessToken,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.moduleDiscussionsService.remove(id, accessToken);
  }

  @Post(':id/replies')
  createReply(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() createDiscussionReply: CreateDiscussionReplyDto,
  ) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.moduleDiscussionsService.createRelply(
      createDiscussionReply,
      accessToken,
    );
  }

  @Patch(':id/replies/:replyId')
  updateReply(
    @Param('id') id: string,
    @Param('replyId') replyId: string,
    @Req() request: Request,
    @Body() updateDiscussionReplyDto: UpdateDiscussionReplyDto,
  ) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.moduleDiscussionsService.updateReply(
      id,
      updateDiscussionReplyDto,
      accessToken,
      replyId,
    );
  }

  @Delete(':id/replies/:replyId')
  removeReply(
    @Param('id') id: string,
    @Param('replyId') replyId: string,
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

    return this.moduleDiscussionsService.removeReply(id, accessToken, replyId);
  }
}
