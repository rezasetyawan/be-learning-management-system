import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateModuleDiscussionDto } from './dto/create-module-discussion.dto';
import { UpdateModuleDiscussionDto } from './dto/update-module-discussion.dto';
import { PG_CONNECTION } from '../../src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { and, eq, ilike } from 'drizzle-orm';
import { CreateDiscussionReplyDto } from './dto/create-dicussion-reply.dto';
import { UpdateDiscussionReplyDto } from './dto/update-discussion-reply.dto';

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
          with: {
            profile: {
              columns: {
                profileImageUrl: true,
              },
            },
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
          with: {
            profile: {
              columns: {
                profileImageUrl: true,
              },
            },
          },
        },
        replies: {
          with: {
            user: {
              columns: {
                fullname: true,
                username: true,
              },
              with: {
                profile: {
                  columns: {
                    profileImageUrl: true,
                  },
                },
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

    if (!data) {
      throw new NotFoundException('Discussion not found');
    }

    return {
      status: 'success',
      data,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(
    discussionId: string,
    updateModuleDiscussionDto: UpdateModuleDiscussionDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const discussion = await this.db.query.moduleDiscussions.findFirst({
      where: (moduleDiscussions, { eq }) =>
        eq(moduleDiscussions.id, discussionId),
      columns: {
        userId: true,
      },
    });

    if (!discussion.userId) {
      throw new NotFoundException('Discussion Not Found');
    }

    if (user.sub !== discussion.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.db
      .update(schema.moduleDiscussions)
      .set(updateModuleDiscussionDto)
      .where(eq(schema.moduleDiscussions.id, discussionId));

    return {
      status: 'success',
    };
  }

  async remove(discussionId: string, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const discussion = await this.db.query.moduleDiscussions.findFirst({
      where: (moduleDiscussions, { eq }) =>
        eq(moduleDiscussions.id, discussionId),
      columns: {
        userId: true,
      },
    });

    if (!discussion.userId) {
      throw new NotFoundException('Discussion Not Found');
    }

    if (user.sub !== discussion.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.db
      .delete(schema.moduleDiscussions)
      .where(eq(schema.moduleDiscussions.id, discussionId));
    return {
      status: 'success',
    };
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

  async updateReply(
    discussionId: string,
    updateDiscussionReplyDto: UpdateDiscussionReplyDto,
    accessToken: string,
    replyId: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const discussion = await this.db.query.moduleDiscussions.findFirst({
      where: (moduleDiscussions, { eq }) =>
        eq(moduleDiscussions.id, discussionId),
      columns: {
        userId: true,
      },
    });

    const reply = await this.db.query.moduleDiscussionReplies.findFirst({
      where: (moduleDiscussionReplies, { eq }) =>
        eq(moduleDiscussionReplies.id, replyId),
      columns: {
        id: true,
      },
    });

    if (!discussion.userId) {
      throw new NotFoundException('Discussion Not Found');
    }

    if (!reply.id) {
      throw new NotFoundException('Discussion Reply Not Found');
    }

    if (user.sub !== discussion.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.db
      .update(schema.moduleDiscussionReplies)
      .set(updateDiscussionReplyDto)
      .where(eq(schema.moduleDiscussionReplies.id, replyId));

    return {
      status: 'success',
    };
  }

  async removeReply(
    discussionId: string,
    accessToken: string,
    replyId: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const discussion = await this.db.query.moduleDiscussions.findFirst({
      where: (moduleDiscussions, { eq }) =>
        eq(moduleDiscussions.id, discussionId),
      columns: {
        userId: true,
      },
    });

    const reply = await this.db.query.moduleDiscussionReplies.findFirst({
      where: (moduleDiscussionReplies, { eq }) =>
        eq(moduleDiscussionReplies.id, replyId),
      columns: {
        id: true,
      },
    });

    if (!discussion.userId) {
      throw new NotFoundException('Discussion Not Found');
    }

    if (!reply.id) {
      throw new NotFoundException('Discussion Reply Not Found');
    }

    if (user.sub !== discussion.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.db
      .delete(schema.moduleDiscussionReplies)
      .where(eq(schema.moduleDiscussionReplies.id, replyId));

    return {
      status: 'success',
    };
  }
}
