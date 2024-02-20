import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PG_CONNECTION } from '../../src/constants';
import * as schema from '../drizzle/schema';
import { JwtService } from '@nestjs/jwt';
import { and, count, eq } from 'drizzle-orm';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}
  async find(token: string) {
    const isTokenValid = await this.jwtService.verifyAsync(token);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(token);
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, data.username),
      with: {
        profile: {},
      },
    });
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
      with: {
        profile: {},
      },
    });
    return user;
  }

  async getUserAcademies(username: string) {
    const user = await this.db.query.users.findFirst({
      columns: {
        username: true,
      },
      where: (users, { eq }) => eq(users.username, username),
      with: {
        academyApplications: {
          where: (academyApplications, { eq }) =>
            eq(academyApplications.status, 'APPROVED'),
          with: {
            academy: {
              with: {
                moduleGroups: {
                  columns: {
                    id: true,
                  },
                  where: (moduleGroups, { eq, and }) =>
                    and(
                      eq(moduleGroups.isDeleted, false),
                      eq(moduleGroups.isPublished, true),
                    ),
                  with: {
                    modules: {
                      where: (modules, { and, eq }) =>
                        and(
                          eq(modules.isDeleted, false),
                          eq(modules.isPublished, true),
                        ),
                      columns: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const userAcademiesPromises = user.academyApplications.map(async (data) => {
      const joinedUserCount = await this.db
        .select({ value: count(schema.academyApplications.id) })
        .from(schema.academyApplications)
        .where(
          and(
            eq(schema.academyApplications.academyId, data.academyId),
            eq(schema.academyApplications.status, 'APPROVED'),
          ),
        );
      const publishedModuleIds = data.academy.moduleGroups.flatMap(
        ({ modules }) => modules.map(({ id }) => id),
      );
      return {
        id: data.academy.id,
        name: data.academy.name,
        createdAt: data.academy.createdAt,
        updatedAt: data.academy.updatedAt,
        isPublished: data.academy.isPublished,
        isDeleted: data.academy.isDeleted,
        coverImageUrl: data.academy.coverImageUrl,
        deletedAt: data.academy.deletedAt,
        deletedBy: data.academy.deletedBy,
        description: data.academy.description,
        moduleCount: publishedModuleIds.length,
        joinedUserCount: joinedUserCount[0].value,
      };
    });
    const academies = await Promise.all(userAcademiesPromises);
    return {
      status: 'success',
      data: academies,
    };
  }
}
