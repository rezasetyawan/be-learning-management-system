import {
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
        userRole.role === 'admin'
          ? eq(userSubmissions.academyId, academyId)
          : and(
              eq(userSubmissions.academyId, academyId),
              eq(userSubmissions.userId, user.sub),
            ),
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

    const data = await this.db
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

    if (!data.length) {
      throw new NotFoundException('Submission not found');
    }

    const transformedData = {
      ...data[0].user_submissions,
      result: data[0].user_submission_results
        ? { ...data[0].user_submission_results }
        : null,
    };
    if (userRole.role === 'admin') {
      return {
        status: 'success',
        data: transformedData,
      };
    }

    if (user.sub !== data[0].user_submissions.userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return {
      status: 'success',
      data: transformedData,
    };
  }
}
