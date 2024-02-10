import { Module } from '@nestjs/common';
import { UserSubmissionsService } from './user-submissions.service';
import { UserSubmissionsController } from './user-submissions.controller';
import { SupabaseService } from 'lib/supabase.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  controllers: [UserSubmissionsController],
  providers: [UserSubmissionsService, SupabaseService],
  imports: [DrizzleModule],
})
export class UserSubmissionsModule {}
