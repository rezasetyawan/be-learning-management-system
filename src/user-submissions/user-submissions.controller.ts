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
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CreateUserSubmissionResultDto } from './dto/create-user-submission-result.dto';
import { CreateUserSubmissionDto } from './dto/create-user-submission.dto';
import { UpdateUserSubmissionDto } from './dto/update-user-submission.do';
import { UserSubmissionsService } from './user-submissions.service';

@Controller('user-submissions')
export class UserSubmissionsController {
  constructor(
    private readonly userSubmissionsService: UserSubmissionsService,
  ) {}

  @Get()
  getAll(@Query('academyId') academyId: string, @Req() request: Request) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    // if (!academyId) {
    //   throw new BadRequestException('Please provide academyId query parameter');
    // }

    return this.userSubmissionsService.getUserSubmissions(
      accessToken,
      academyId,
    );
  }

  @Get(':submissionId')
  findOne(
    @Param('submissionId') submissionId: string,
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

    return this.userSubmissionsService.getUserSubmissionById(
      submissionId,
      accessToken,
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('submissionFile'))
  createUserSubmission(
    @Body() createUserSubmissionDto: CreateUserSubmissionDto,
    @Req() request: Request,
    @UploadedFile()
    submissionFile: Express.Multer.File,
  ) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.userSubmissionsService.createUserSubmission(
      createUserSubmissionDto,
      submissionFile,
      accessToken,
    );
  }

  @Patch(':submissionId')
  updateUserSubmission(
    @Param('submissionId') submissionId: string,
    @Body() updateUserSubmissionDto: UpdateUserSubmissionDto,
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

    return this.userSubmissionsService.updateUserSubmission(
      submissionId,
      updateUserSubmissionDto,
      accessToken,
    );
  }

  @Post(':submissionId/result')
  addResult(
    @Param('submissionId') submissionId: string,
    @Body() createUserSubmissionResultDto: CreateUserSubmissionResultDto,
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

    return this.userSubmissionsService.createSubmissionResult(
      submissionId,
      createUserSubmissionResultDto,
      accessToken,
    );
  }
}
