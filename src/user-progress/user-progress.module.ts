import { Module } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { UserProgressController } from './user-progress.controller';
import { DrizzleModule } from '../../src/drizzle/drizzle.module';

@Module({
  controllers: [UserProgressController],
  providers: [UserProgressService],
  imports: [DrizzleModule],
})
export class UserProgressModule {}
