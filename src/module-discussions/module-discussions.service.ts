import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateModuleDiscussionDto } from './dto/create-module-discussion.dto';
import { UpdateModuleDiscussionDto } from './dto/update-module-discussion.dto';
import { PG_CONNECTION } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { and, ilike } from 'drizzle-orm';
import { CreateDiscussionReplyDto } from './dto/create-dicussion-reply.dto';

@Injectable()
export class ModuleDiscussionsService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}
  async create(
    createModuleDiscussionDto: CreateModuleDiscussionDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const module = await this.db.query.academyModules.findFirst({
      where: (academyModules, { and, eq }) =>
        and(
          eq(academyModules.id, createModuleDiscussionDto.moduleId),
          eq(academyModules.isDeleted, false),
        ),
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const payload = {
      id: nanoid(40),
      userId: user.sub,
      ...createModuleDiscussionDto,
    };

    await this.db.insert(schema.moduleDiscussions).values(payload);

    return {
      status: 'success',
    };
  }

  async findAll(
    moduleId: string | undefined,
    academyId: string | undefined,
    searchKey: string = '',
  ) {
    if (!academyId) {
      throw new BadRequestException('Please provied academyId query param');
    }

    const academy = await this.db.query.academies.findFirst({
      where: (academies, { and, eq }) =>
        and(eq(academies.id, academyId), eq(academies.isDeleted, false)),
    });

    if (!academy) {
      throw new NotFoundException('Academy not found');
    }

    const data = await this.db.query.moduleDiscussions.findMany({
      where: (moduleDiscussions, { eq }) =>
        moduleId
          ? and(
              eq(moduleDiscussions.moduleId, moduleId),
              eq(moduleDiscussions.academyId, academyId),
              ilike(moduleDiscussions.title, `%${searchKey}%`),
            )
          : and(
              eq(moduleDiscussions.academyId, academyId),
              ilike(moduleDiscussions.title, `%${searchKey}%`),
            ),
      with: {
        user: {
          columns: {
            fullname: true,
            username: true,
          },
        },
        replies: {
          columns: {
            id: true,
          },
        },
        module: {
          columns: {
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

  async findOne(discussionId: string) {
    const data = await this.db.query.moduleDiscussions.findFirst({
      where: (moduleDiscussions, { eq }) =>
        eq(moduleDiscussions.id, discussionId),
      with: {
        user: {
          columns: {
            fullname: true,
            username: true,
          },
        },
        replies: {
          with: {
            user: {
              columns: {
                fullname: true,
                username: true,
              },
            },
          },
        },
        module: {
          columns: {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateModuleDiscussionDto: UpdateModuleDiscussionDto) {
    return `This action updates a #${id} moduleDiscussion`;
  }

  remove(id: number) {
    return `This action removes a #${id} moduleDiscussion`;
  }

  async createRelply(
    createDiscussionReplyDto: CreateDiscussionReplyDto,
    accessToken,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const payload = {
      ...createDiscussionReplyDto,
      id: nanoid(40),
      userId: user.sub,
    };

    await this.db.insert(schema.moduleDiscussionReplies).values(payload);

    return {
      status: 'success',
    };
  }
}
