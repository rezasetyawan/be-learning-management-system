import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PG_CONNECTION } from 'src/constants';
import * as schema from '../drizzle/schema';
import { ActionType, EntityType } from 'src/enums/audit-log.enum';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

interface CreateProps {
  entityType: EntityType;
  entityName: string;
  actionType: ActionType;
  userId: string;
  entityId: string;
  createdAt: string;
}
@Injectable()
export class AuditLogService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create({
    entityName,
    entityId,
    entityType,
    actionType,
    userId,
    createdAt,
  }: CreateProps) {
    try {
      const payload = {
        id: nanoid(50),
        entityId: entityId,
        entityType: entityType,
        entityName: entityName,
        actionType: actionType,
        userId: userId,
        createdAt: createdAt,
      };
      await this.db.insert(schema.auditLogs).values(payload);
    } catch (error) {
      console.error(error);
    }
  }

  async getEntityLogs(entityId: string, entitiyType: string) {
    try {
      const data = await this.db.query.auditLogs.findMany({
        where: (auditLogs, { and }) =>
          and(
            eq(auditLogs.entityId, entityId),
            eq(auditLogs.entityType, entitiyType),
          ),

        with: {
          user: {
            columns: {
              fullname: true,
            },
          },
        },
        orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
      });

      return {
        status: 'success',
        data,
      };
    } catch (error) {}
  }
}
