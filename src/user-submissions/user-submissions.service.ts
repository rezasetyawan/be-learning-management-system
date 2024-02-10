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

@Injectable()
export class UserSubmissionsService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private readonly supabaseService: SupabaseService,
    private jwtService: JwtService,
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
}
