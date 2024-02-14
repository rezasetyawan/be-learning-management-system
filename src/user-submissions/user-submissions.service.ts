import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as schema from '../drizzle/schema';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from 'lib/supabase.service';
import { PG_CONNECTION } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateUserSubmissionDto } from './dto/create-user-submission.dto';
import { eq } from 'drizzle-orm';
import { SupabaseBucket } from 'src/enums/supabase-bucket-enum';
import { nanoid } from 'nanoid';
import { UsersService } from 'src/users/users.service';
import { UpdateUserSubmissionDto } from './dto/update-user-submission.do';
import { CreateUserSubmissionResultDto } from './dto/create-user-submission-result.dto';

@Injectable()
export class UserSubmissionsService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private readonly supabaseService: SupabaseService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async createUserSubmission(
    createUserSubmissionDto: CreateUserSubmissionDto,
    submissionFile: Express.Multer.File,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const academy = await this.db
      .select({
        id: schema.academies.id,
        name: schema.academies.name,
        isDeleted: schema.academies.isDeleted,
      })
      .from(schema.academies)
      .where(eq(schema.academies.id, createUserSubmissionDto.academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const module = await this.db.query.academyModules.findFirst({
      where: (academyModules, { and, eq }) =>
        and(
          eq(academyModules.id, createUserSubmissionDto.moduleId),
          eq(academyModules.isDeleted, false),
        ),
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const fileUrl = await this.supabaseService.uploadToPublicStorage(
      SupabaseBucket.SUBMISSION_FILES,
      submissionFile,
      `${submissionFile.originalname.replace(/\s/g, '')}-${Date.now()}`,
    );

    const payload = {
      ...createUserSubmissionDto,
      fileUrl: fileUrl,
      id: nanoid(40),
      userId: user.sub as string,
    };

    await this.db.insert(schema.userSubmissions).values(payload);

    return {
      status: 'success',
    };
  }

  async getUserSubmissionsByAcademyId(academyId: string, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const userRole = await this.usersService.getRole(user.username as string);

    const academy = await this.db
      .select({
        id: schema.academies.id,
        name: schema.academies.name,
        isDeleted: schema.academies.isDeleted,
      })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const data = await this.db.query.userSubmissions.findMany({
      where: (userSubmissions, { and, eq }) =>
        userRole.role === 'admin' || userRole.role === 'superadmin'
          ? eq(userSubmissions.academyId, academyId)
          : and(
              eq(userSubmissions.academyId, academyId),
              eq(userSubmissions.userId, user.sub),
            ),
      with: {
        user: {
          columns: {
            fullname: true,
          },
        },
        module: {
          columns: {
            name: true,
            id: true,
          },
        },
      },
    });

    return {
      status: 'success',
      data,
    };
  }

  async getUserSubmissionById(submissionId: string, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const userRole = await this.usersService.getRole(user.username as string);

    // const data = await this.db
    //   .select({
    //     id: schema.userSubmissions.id,
    //     createdAt: schema.userSubmissions.createdAt,
    //     note: schema.userSubmissions.note,
    //     fileUrl: schema.userSubmissions.fileUrl,
    //     status: schema.userSubmissions.status,
    //     academyId: schema.userSubmissions.academyId,
    //     academyName: schema.academies.name,
    //     user: {
    //       id: schema.users.id,
    //       fullname: schema.users.fullname,
    //     },
    //     moduleName: schema.academyModules.name,
    //     moduleId: schema.academyModules.id,
    //     moduleGroupId: schema.academyModules.academyModuleGroupId,
    //     result: schema.userSubmissionResults,
    //   })
    //   .from(schema.userSubmissions)
    //   .where(eq(schema.userSubmissions.id, submissionId))
    //   .leftJoin(
    //     schema.userSubmissionResults,
    //     eq(
    //       schema.userSubmissions.id,
    //       schema.userSubmissionResults.submissionId,
    //     ),
    //   )
    //   .rightJoin(
    //     schema.users,
    //     eq(schema.userSubmissions.userId, schema.users.id),
    //   )
    //   .rightJoin(
    //     schema.academyModules,
    //     eq(schema.userSubmissions.moduleId, schema.academyModules.id),
    //   )
    //   .rightJoin(
    //     schema.academies,
    //     eq(schema.userSubmissions.academyId, schema.academies.id),
    //   );

    const data = await this.db.query.userSubmissions.findFirst({
      where: (submissions, { eq }) => eq(submissions.id, submissionId),
      with: {
        result: {
          with: {
            reviewer: {
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
            id: true,
          },
          with: {
            group: {
              columns: {
                id: true,
              },
            },
          },
        },
        academy: {
          columns: {
            name: true,
            id: true,
          },
        },
        user: {
          columns: {
            fullname: true,
            username: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Submission not found');
    }

    const allActiveSubmissionsInCurrentModule =
      await this.db.query.userSubmissions.findMany({
        where: (submissions, { eq, and }) =>
          and(
            eq(submissions.moduleId, data.moduleId),
            eq(submissions.status, 'PENDING'),
          ),
        columns: {
          id: true,
        },
        orderBy: (submissions, { asc }) => [asc(submissions.createdAt)],
      });

    const userSubmissionWaitingOrder =
      allActiveSubmissionsInCurrentModule.findIndex(
        (item) => item.id === data.id,
      ) + 1;

    if (userRole.role === 'admin' || userRole.role === 'superadmin') {
      return {
        status: 'success',
        data: {
          ...data,
          waitingOrder:
            data.status === 'REVIEW' ? 0 : userSubmissionWaitingOrder,
        },
      };
    }

    if (user.sub !== data.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      status: 'success',
      data: {
        ...data,
        waitingOrder: data.status === 'REVIEW' ? 0 : userSubmissionWaitingOrder,
      },
    };
  }

  async updateUserSubmission(
    submissionId: string,
    updateUserSubmissionDto: UpdateUserSubmissionDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const userRole = await this.usersService.getRole(user.username as string);

    const submissions = await this.db
      .select()
      .from(schema.userSubmissions)
      .where(eq(schema.userSubmissions.id, submissionId));

    if (!submissions.length) {
      throw new NotFoundException('Submission not found');
    }

    if (
      updateUserSubmissionDto.status !== 'PENDING' &&
      updateUserSubmissionDto.status !== 'REVIEW' &&
      updateUserSubmissionDto.status !== 'REVIEWED'
    ) {
      throw new BadRequestException('Status property not valid');
    }

    if (userRole.role === 'admin' || userRole.role === 'superadmin') {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.db
      .update(schema.userSubmissions)
      .set(updateUserSubmissionDto)
      .where(eq(schema.userSubmissions.id, submissionId));

    return {
      status: 'success',
    };
  }

  async createSubmissionResult(
    submissionId: string,
    createUserSubmissionResultDto: CreateUserSubmissionResultDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const userRole = await this.usersService.getRole(user.username as string);

    const submissions = await this.db
      .select()
      .from(schema.userSubmissions)
      .where(eq(schema.userSubmissions.id, submissionId))
      .leftJoin(
        schema.userSubmissionResults,
        eq(
          schema.userSubmissions.id,
          schema.userSubmissionResults.submissionId,
        ),
      );

    if (!submissions.length) {
      throw new NotFoundException('Submission not found');
    }

    if (submissions[0].user_submission_results !== null) {
      throw new ConflictException('Sorry, the submission already reviewed');
    }

    if (userRole.role === 'admin' || userRole.role === 'superadmin') {
      throw new UnauthorizedException('Unauthorized');
    }

    function validateScore<T>(value: T): boolean {
      if (typeof value !== 'number') {
        return false;
      } else {
        if (value > 100) {
          return false;
        } else {
          return true;
        }
      }
    }

    if (!validateScore(createUserSubmissionResultDto.score)) {
      throw new BadRequestException('Score property not valid');
    }

    const payload = {
      id: nanoid(40),
      reviewer: user.sub as string,
      ...createUserSubmissionResultDto,
      submissionId,
    };

    await this.db
      .update(schema.userSubmissions)
      .set({ status: 'REVIEWED' })
      .where(eq(schema.userSubmissions.id, submissionId));

    await this.db.insert(schema.userSubmissionResults).values(payload);

    return {
      status: 'success',
    };
  }
}
