import { Module } from '@nestjs/common';
import { AcademiesService } from './academies.service';
import { AcademiesController } from './academies.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { SupabaseService } from 'lib/supabase.service';

@Module({
  controllers: [AcademiesController],
  providers: [AcademiesService, SupabaseService],
  imports: [DrizzleModule],
})
export class AcademiesModule {}
