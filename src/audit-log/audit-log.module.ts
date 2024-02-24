import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { DrizzleModule } from '../../src/drizzle/drizzle.module';
import { AuditLogController } from './audit-log.controller';

@Module({
  providers: [AuditLogService],
  imports: [DrizzleModule],
  controllers: [AuditLogController],
})
export class AuditLogModule {}
