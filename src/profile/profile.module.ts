import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [DrizzleModule],
})
export class ProfileModule {}
