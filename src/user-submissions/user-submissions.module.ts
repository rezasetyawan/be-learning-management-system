import { Module } from '@nestjs/common';
import { UserSubmissionsService } from './user-submissions.service';
import { UserSubmissionsController } from './user-submissions.controller';
import { SupabaseService } from '../../lib/supabase.service';
import { DrizzleModule } from '../../src/drizzle/drizzle.module';
import { UsersService } from '../../src/users/users.service';

@Module({
  controllers: [UserSubmissionsController],
  providers: [UserSubmissionsService, SupabaseService, UsersService],
  imports: [DrizzleModule],
})
export class UserSubmissionsModule {}
