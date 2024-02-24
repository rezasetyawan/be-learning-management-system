import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { UsersService } from '../../src/users/users.service';
import { SupabaseService } from 'lib/supabase.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, UsersService, SupabaseService],
  imports: [DrizzleModule],
})
export class ProfileModule {}
