import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}
  @Get()
  getModuleGroups(
    @Param('id') id: string,
    @Query('entityId') entityId: string,
    @Query('entityType') entityType: string,
    @Req() request: Request,
  ) {
    const { authorization } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    const accessToken = authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!entityId || !entityType) {
      throw new BadRequestException(
        'Please provide entityId and entityType query parameter',
      );
    }
    return this.auditLogService.getEntityLogs(entityId, entityType);
  }
}
