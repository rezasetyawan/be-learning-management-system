import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as schema from '../drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PG_CONNECTION } from '../../src/constants';
import { JwtService } from '@nestjs/jwt';
import { CreateAcademyApplicationDto } from './dto/create-academy-application.dto';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { UpdateAcademyApplicationDto } from './dto/update-academy-application.dto';
@Injectable()
export class AcademyApplicationsService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async create(
    createAcademyApplicationDto: CreateAcademyApplicationDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, createAcademyApplicationDto.academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const timestamp = Date.now().toString();
    const payload = {
      id: nanoid(40),
      userId: user.sub as string,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...createAcademyApplicationDto,
    };

    await this.db.insert(schema.academyApplications).values(payload);

    return {
      status: 'success',
    };
  }

  async findOne(academyId: string, accessToken: string) {
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

    const data = await this.db.query.academyApplications.findMany({
      where: (academyApplications, { and, eq }) =>
        and(
          eq(academyApplications.userId, user.sub as string),
          eq(academyApplications.academyId, academyId),
        ),
      orderBy: (academyApplications, { desc }) => [
        desc(academyApplications.createdAt),
      ],
    });

    return {
      status: 'success',
      data: data.length ? data[data.length - 1] : undefined,
    };
  }

  async getAll() {
    const data = await this.db.query.academyApplications.findMany({
      with: {
        user: {
          columns: {
            username: true,
            fullname: true,
          },
        },
        academy: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      status: 'success',
      data,
    };
  }

  async getAcademyJoinedUser(academyId: string) {
    const academy = await this.db.query.academies.findFirst({
      columns: {
        id: true,
        name: true,
      },
      where: (academies, { eq }) => eq(academies.id, academyId),
      with: {
        moduleGroups: {
          with: {
            modules: {
              columns: {
                id: true,
              },
              where: (modules, { and, eq }) =>
                and(
                  eq(modules.isPublished, true),
                  eq(modules.isDeleted, false),
                ),
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
        },
      },
    });

    const publishedModuleId = academy.moduleGroups.flatMap(({ modules }) =>
      modules.map(({ id }) => id),
    );
    const data = await this.db.query.academyApplications.findMany({
      with: {
        user: {
          columns: {
            username: true,
            fullname: true,
          },
          with: {
            progress: {
              where: (progress, { inArray }) =>
                inArray(progress.moduleId, publishedModuleId),

              columns: {
                id: true,
                createdAt: true,
              },
              orderBy: (progress, { desc }) => [desc(progress.createdAt)],
            },
          },
        },
      },
      where: (academyApplications, { and, eq }) =>
        and(
          eq(academyApplications.academyId, academyId),
          eq(academyApplications.status, 'APPROVED'),
        ),
    });

    const joinedUser = data.map((d) => {
      const userProgressPercentage = (
        (d.user.progress.length / publishedModuleId.length) *
        100
      ).toFixed(0);
      const item = {
        fullname: d.user.fullname,
        username: d.user.username,
        userProgressPercentage,
        lastActivity: d.user.progress[0] ? d.user.progress[0].createdAt : null,
        academyName: academy.name,
        academyId: academy.id,
      };

      return item;
    });

    return {
      status: 'success',
      data: joinedUser,
    };
  }

  async update(
    id: string,
    updateAcademyApplicationDto: UpdateAcademyApplicationDto,
  ) {
    const data = await this.db.query.academyApplications.findFirst({
      where: (applications, { eq }) => eq(applications.id, id),
    });

    if (!data) {
      throw new NotFoundException('Data not found');
    }

    const payload = {
      ...updateAcademyApplicationDto,
      updatedAt: Date.now().toString(),
    };

    await this.db
      .update(schema.academyApplications)
      .set(payload)
      .where(eq(schema.academyApplications.id, id));

    return {
      status: 'success',
    };
  }
}
