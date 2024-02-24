import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PG_CONNECTION } from '../../src/constants';
import * as schema from '../drizzle/schema';
import { JwtService } from '@nestjs/jwt';
import { and, count, eq } from 'drizzle-orm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SupabaseService } from 'lib/supabase.service';
import { UsersService } from 'src/users/users.service';
import { SupabaseBucket } from 'src/enums/supabase-bucket-enum';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
    private usersService: UsersService,
  ) {}
  async find(token: string) {
    const isTokenValid = await this.jwtService.verifyAsync(token);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(token);
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, data.sub as string),
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

    if (!user) throw new NotFoundException('User not found');

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

    if (!user) throw new NotFoundException('User not found');

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

  async updateProfile(
    accessToken: string,
    updateProfileDto: UpdateProfileDto,
    profileImage?: Express.Multer.File,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(accessToken);
    const timestamp = Date.now().toString();

    const currentUser = await this.db.query.users.findFirst({
      columns: {
        username: true,
      },
      where: (users, { eq }) => eq(users.id, data.sub as string),
    });

    if (currentUser.username !== updateProfileDto.username) {
      const user = await this.usersService.findOne(updateProfileDto.username);
      if (user && user.id) {
        throw new BadRequestException(
          'Gagal untuk update profile, username sudah digunakan',
        );
      }
    }

    const payload = {
      fullname: updateProfileDto.fullname,
      username: updateProfileDto.username,
      updatedAt: timestamp,
    };

    await this.db
      .update(schema.users)
      .set(payload)
      .where(eq(schema.users.id, data.sub as string));
    await this.db
      .update(schema.userProfile)
      .set({ about: updateProfileDto.about })
      .where(eq(schema.userProfile.userId, data.sub as string));

    if (profileImage) {
      const oldProfilePicture = await this.db
        .select({ profileImageUrl: schema.userProfile.profileImageUrl })
        .from(schema.userProfile)
        .where(eq(schema.userProfile.userId, data.sub as string));

      if (oldProfilePicture.length && oldProfilePicture[0].profileImageUrl) {
        await this.supabaseService.deleteFromPublicStorage(
          SupabaseBucket.PROFILE_PICTURES,
          oldProfilePicture[0].profileImageUrl,
        );
      }
      const fileUrl = await this.supabaseService.uploadToPublicStorage(
        SupabaseBucket.PROFILE_PICTURES,
        profileImage,
        `${updateProfileDto.username}-${timestamp}`,
      );

      await this.db
        .update(schema.userProfile)
        .set({ profileImageUrl: fileUrl })
        .where(eq(schema.userProfile.userId, data.sub as string));
    }

    const jwtPayload = { sub: data.sub, username: updateProfileDto.username };
    const access_token = await this.jwtService.signAsync(jwtPayload);
    return {
      status: 'success',
      data: {
        accessToken: access_token,
      },
    };
  }
}
