import { Module } from '@nestjs/common';
import { AcademiesService } from './academies.service';
import { AcademiesController } from './academies.controller';
import { DrizzleModule } from '../../src/drizzle/drizzle.module';
import { SupabaseService } from '../../lib/supabase.service';
import { AuditLogService } from '../../src/audit-log/audit-log.service';
import { UsersService } from '../../src/users/users.service';

@Module({
  controllers: [AcademiesController],
  providers: [AcademiesService, SupabaseService, AuditLogService, UsersService],
  imports: [DrizzleModule],
})
export class AcademiesModule {}
