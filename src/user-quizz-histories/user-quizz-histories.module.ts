import { Module } from '@nestjs/common';
import { UserQuizzHistoriesService } from './user-quizz-histories.service';
import { UserQuizzHistoriesController } from './user-quizz-histories.controller';
import { DrizzleModule } from '../../src/drizzle/drizzle.module';

@Module({
  controllers: [UserQuizzHistoriesController],
  providers: [UserQuizzHistoriesService],
  imports: [DrizzleModule],
})
export class UserQuizzHistoriesModule {}
