import { Module } from '@nestjs/common';
import { UserSubmissionsService } from './user-submissions.service';
import { UserSubmissionsController } from './user-submissions.controller';

@Module({
  controllers: [UserSubmissionsController],
  providers: [UserSubmissionsService],
})
export class UserSubmissionsModule {}
