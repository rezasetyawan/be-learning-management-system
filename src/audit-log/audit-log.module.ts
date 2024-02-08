import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  providers: [AuditLogService],
  imports: [DrizzleModule],
})
export class AuditLogModule {}
