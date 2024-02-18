import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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
}
