import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as schema from '../drizzle/schema';
import { PG_CONNECTION } from '../../src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtService } from '@nestjs/jwt';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { nanoid } from 'nanoid';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class UserProgressService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async upsert(
    createUserProgressDto: CreateUserProgressDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const timestamp = Date.now().toString();
    const payload = {
      id: nanoid(40),
      userId: user.sub as string,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...createUserProgressDto,
    };

    const updatePayload = {
      ...createUserProgressDto,
      updatedAt: timestamp,
    };

    await this.db
      .insert(schema.userProgress)
      .values(payload)
      .onConflictDoUpdate({
        target: [schema.userProgress.userId, schema.userProgress.moduleId],
        set: updatePayload,
        where: and(
          eq(schema.userProgress.userId, user.sub as string),
          eq(schema.userProgress.moduleId, createUserProgressDto.moduleId),
        ),
      });

    return {
      status: 'success',
    };
  }

  async getProgress(academyId: string, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const data = await this.db.query.academyModuleGroups.findMany({
      with: {
        modules: {
          columns: {
            id: true,
          },
          where: (modules, { and, eq }) =>
            and(eq(modules.isPublished, true), eq(modules.isDeleted, false)),
        },
      },
      columns: {
        id: true,
      },
      where: (group, { and, eq }) =>
        and(
          eq(group.academyId, academyId),
          eq(group.isPublished, true),
          eq(group.isDeleted, false),
        ),
    });

    const publishedModuleId = data.flatMap(({ modules }) =>
      modules.map(({ id }) => id),
    );

    const validCompletedModule = await this.db.query.userProgress.findMany({
      where: (progress, { and, eq, inArray }) =>
        and(
          eq(progress.userId, user.sub as string),
          inArray(progress.moduleId, publishedModuleId),
        ),

      columns: {
        id: true,
      },
    });

    const userProgressPercentage = (
      (validCompletedModule.length / publishedModuleId.length) *
      100
    ).toFixed(0);
    return {
      status: 'success',
      data: {
        userProgressPercentage,
      },
    };
  }
}
