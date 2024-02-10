import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserSubmissionsService } from './user-submissions.service';
import { CreateUserSubmissionDto } from './dto/create-user-submission.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('user-submissions')
export class UserSubmissionsController {
  constructor(
    private readonly userSubmissionsService: UserSubmissionsService,
  ) {}

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
}
