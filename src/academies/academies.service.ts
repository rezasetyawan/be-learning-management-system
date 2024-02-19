import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAcademyDto } from './dto/create-academy.dto';
// import { UpdateAcademyDto } from './dto/update-academy.dto';
import { JwtService } from '@nestjs/jwt';
import { eq, ilike, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SupabaseService } from '../../lib/supabase.service';
import { nanoid } from 'nanoid';
import { PG_CONNECTION } from '../../src/constants';
import { SupabaseBucket } from '../../src/enums/supabase-bucket-enum';
import * as schema from '../drizzle/schema';
import { CreateModuleGroupDto } from './dto/create-module-group.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateUserLastReadDto } from './dto/create-user-last-read.dto';
import { CreateQuestionAnswerDto } from './dto/quizz-question-answer/create-question-answer.dto';
import UpdateQuestionAnswerDto from './dto/quizz-question-answer/update-question-answer.dto';
import { CreateQuizzQuestionDto } from './dto/quizz-question/create-quizz-question.dto';
import { UpdateQuizzQuestionDto } from './dto/quizz-question/update-quzz-question.dto';
import { CreateQuizzDto } from './dto/quizz/create-quizz-dto';
import UpdateQuizzDto from './dto/quizz/update-quizz.dto';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { UpdateModuleGroupDto } from './dto/update-module-group.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AuditLogService } from '../../src/audit-log/audit-log.service';
import { ActionType, EntityType } from '../../src/enums/audit-log.enum';
import { UsersService } from '../../src/users/users.service';

@Injectable()
export class AcademiesService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private readonly supabaseService: SupabaseService,
    private jwtService: JwtService,
    private readonly auditLogsService: AuditLogService,
    private usersService: UsersService,
  ) {}

  // ACADEMIES
  async create(createAcademyDto: CreateAcademyDto, accessToken: string) {
    const academy = {
      id: nanoid(20),
      ...createAcademyDto,
    };
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    await this.db.insert(schema.academies).values(academy);
    await this.auditLogsService.create({
      actionType: ActionType.CREATE,
      entityName: academy.name,
      entityType: EntityType.ACADEMY,
      entityId: academy.id,
      userId: user.sub as string,
      createdAt: academy.createdAt,
    });
    return {
      status: 'success',
      data: {
        academy_id: academy.id,
      },
    };
  }

  async updateAcademy(
    academyId: string,
    updateAcademyDto: UpdateAcademyDto,
    accessToken: string,
    academyCoverPicture?: Express.Multer.File,
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
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const { name, updatedAt, description, isPublished, isDeleted, deletedAt } =
      updateAcademyDto;

    if (
      name ||
      updatedAt ||
      description ||
      isPublished !== undefined ||
      isDeleted !== undefined
    ) {
      const payload = {
        ...updateAcademyDto,
        ...(isDeleted && { deletedBy: user.sub as string }),
        ...(isDeleted === false && {
          deletedBy: null,
          deletedAt: null,
        }),
      };
      await this.db
        .update(schema.academies)
        .set(payload)
        .where(eq(schema.academies.id, academyId));
    }
    if (academyCoverPicture) {
      const oldCoverPicture = await this.db
        .select({ coverImageUrl: schema.academies.coverImageUrl })
        .from(schema.academies)
        .where(eq(schema.academies.id, academyId));

      if (oldCoverPicture.length) {
        await this.supabaseService.deleteFromPublicStorage(
          SupabaseBucket.ACADEMY_COVER_PICTURES,
          oldCoverPicture[0].coverImageUrl,
        );
      }
      const fileUrl = await this.supabaseService.uploadToPublicStorage(
        SupabaseBucket.ACADEMY_COVER_PICTURES,
        academyCoverPicture,
        academyId,
      );

      await this.db
        .update(schema.academies)
        .set({ coverImageUrl: fileUrl })
        .where(eq(schema.academies.id, academyId));
    }

    await this.auditLogsService.create({
      actionType:
        isDeleted === undefined
          ? ActionType.UPDATE
          : !isDeleted
            ? ActionType.UPDATE
            : ActionType.DELETE,
      entityName: updateAcademyDto.name
        ? updateAcademyDto.name
        : academy[0].name,
      entityType: EntityType.ACADEMY,
      entityId: academyId,
      userId: user.sub as string,
      createdAt: deletedAt ? deletedAt : updateAcademyDto.updatedAt,
    });
    return {
      status: 'success',
    };
  }

  async findAll(
    isDeleted: boolean,
    searchKey: string = '',
    accessToken?: string,
  ) {
    if (accessToken) {
      const isTokenValid = await this.jwtService.verifyAsync(accessToken);

      if (!isTokenValid) {
        throw new UnauthorizedException('Unauthorized');
      }

      const user = this.jwtService.decode(accessToken);
      const userRole = await this.usersService.getRole(user.username as string);
      const data = await this.db.query.academies.findMany({
        where: (academies, { and, eq }) =>
          accessToken &&
          (userRole.role === 'admin' || userRole.role === 'superadmin')
            ? and(
                eq(academies.isDeleted, isDeleted),
                ilike(academies.name, `%${searchKey}%`),
              )
            : and(
                eq(academies.isDeleted, isDeleted),
                ilike(academies.name, `%${searchKey}%`),
                eq(academies.isPublished, true),
              ),
      });
      return data;
    } else {
      console.log('testt bang');
      const data = await this.db.query.academies.findMany({
        where: (academies, { and, eq }) =>
          and(
            eq(academies.isDeleted, isDeleted),
            ilike(academies.name, `%${searchKey}%`),
            eq(academies.isPublished, true),
          ),
      });
      return data;
    }
  }

  async findOne(id: string) {
    const data = await this.db.query.academies.findFirst({
      where: (academies, { and, eq }) => and(eq(academies.id, id)),
      // and(eq(academies.id, id), eq(academies.isDeleted, false)),
      with: {
        moduleGroups: {
          columns: {
            createdAt: false,
            updatedAt: false,
            academyId: false,
          },
          orderBy: (moduleGroups, { asc }) => [asc(moduleGroups.order)],
          with: {
            modules: {
              columns: {
                createdAt: false,
                updatedAt: false,
                academyModuleGroupId: false,
              },
              orderBy: (modules, { asc }) => [asc(modules.order)],
              where: (modules, { eq }) => eq(modules.isDeleted, false),
            },
          },
          where: (moduleGroups, { eq }) => eq(moduleGroups.isDeleted, false),
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Academy not found');
    }
    return {
      status: 'success',
      data: data,
    };
  }

  // TODO: GET LAST READED MODULE FROM DATABASE
  // TODO: HANDLE ERROR IF MODULE GROUP DOESN'T HAVE MODULES
  async getUserLastReadModule(academyId: string, accessToken: string) {
    const module = await this.db.query.academies.findFirst({
      where: (academies, { and, eq }) => and(eq(academies.id, academyId)),
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(accessToken);

    const lastReadModule = await this.db.query.userModuleLastRead.findFirst({
      where: (userModuleLastRead, { eq }) =>
        eq(userModuleLastRead.userId, data.sub),
      columns: {
        moduleGroupId: true,
        moduleId: true,
      },
    });

    if (!lastReadModule) {
      console.log('TESSTTTT');
      const data = await this.db.query.academyModuleGroups.findMany({
        columns: {
          id: true,
        },
        where: (moduleGroup, { and, eq }) =>
          and(
            eq(moduleGroup.academyId, academyId),
            eq(moduleGroup.isDeleted, false),
          ),
        orderBy: (moduleGroup, { asc }) => [asc(moduleGroup.order)],
      });

      const module = await this.db.query.academyModules.findMany({
        columns: {
          id: true,
        },
        where: (module, { and, eq }) =>
          and(
            eq(module.isDeleted, false),
            eq(module.academyModuleGroupId, data[0].id),
          ),
        orderBy: (module, { asc }) => [asc(module.order)],
      });

      return {
        status: 'succcess',
        data: {
          moduleGroupId: data[0].id,
          moduleId: module[0].id,
        },
      };
    }

    console.log(lastReadModule);
    return {
      status: 'succcess',
      data: {
        moduleGroupId: lastReadModule.moduleGroupId,
        moduleId: lastReadModule.moduleId,
      },
    };
  }

  async upsertUserLastReadModul(
    academyId: string,
    accessToken: string,
    createUserLastReadDto: CreateUserLastReadDto,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const data = this.jwtService.decode(accessToken);

    const payload = {
      ...createUserLastReadDto,
      userId: data.sub,
      id: data.sub,
    };

    await this.db
      .insert(schema.userModuleLastRead)
      .values(payload)
      .onConflictDoUpdate({
        target: schema.userModuleLastRead.id,
        set: payload,
      });

    return {
      status: 'success',
    };
  }

  async deleteAcademy(academyId: string, accessToken) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    await this.db
      .delete(schema.academies)
      .where(eq(schema.academies.id, academyId));

    return {
      status: 'success',
    };
  }

  // MODULE GROUPS
  async addModuleGroup(
    createModuleGroupDto: CreateModuleGroupDto,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const moduleGroup = {
      id: nanoid(20),
      ...createModuleGroupDto,
    };
    await this.db.insert(schema.academyModuleGroups).values(moduleGroup);
    await this.auditLogsService.create({
      actionType: ActionType.CREATE,
      entityName: moduleGroup.name,
      entityType: EntityType.MODULE_GROUP,
      entityId: moduleGroup.id,
      userId: user.sub as string,
      createdAt: moduleGroup.createdAt,
    });
    return {
      status: 'success',
      data: {
        moduleGroupId: moduleGroup.id,
      },
    };
  }

  async updateModuleGroup(
    academyId: string,
    moduleGroupId: string,
    updateModuleGroupDto: UpdateModuleGroupDto,
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
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const moduleGroup = await this.db
      .select({
        id: schema.academyModuleGroups.id,
        name: schema.academyModuleGroups.name,
        isDeleted: schema.academyModuleGroups.isDeleted,
      })
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    if (!moduleGroup.length) {
      throw new NotFoundException('Module group not found');
    }

    const payload = {
      ...updateModuleGroupDto,
      ...(updateModuleGroupDto.isDeleted && { deletedBy: user.sub as string }),
      ...(updateModuleGroupDto.isDeleted === false && {
        deletedBy: null,
        deletedAt: null,
      }),
    };

    await this.db
      .update(schema.academyModuleGroups)
      .set(payload)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    await this.auditLogsService.create({
      actionType:
        updateModuleGroupDto.isDeleted === undefined
          ? ActionType.UPDATE
          : !updateModuleGroupDto.isDeleted
            ? ActionType.UPDATE
            : ActionType.DELETE,
      entityName: updateModuleGroupDto.name
        ? updateModuleGroupDto.name
        : moduleGroup[0].name,
      entityType: EntityType.MODULE_GROUP,
      entityId: moduleGroupId,
      userId: user.sub as string,
      createdAt: updateModuleGroupDto.deletedAt
        ? updateModuleGroupDto.deletedAt
        : updateModuleGroupDto.updatedAt,
    });

    return {
      status: 'success',
    };
  }

  async getModuleGroups(academyId: string, isDeleted: boolean) {
    const data = await this.db.query.academyModuleGroups.findMany({
      where: (modules, { and, eq }) =>
        and(eq(modules.academyId, academyId), eq(modules.isDeleted, isDeleted)),
      with: {
        user: {
          columns: {
            fullname: true,
          },
        },
      },
    });

    const transformedData = data.map((item) => {
      const moduleGroup = {
        ...item,
        deletedBy: item.user && item.user.fullname ? item.user.fullname : null,
      };

      delete moduleGroup.user;
      return moduleGroup;
    });

    return {
      status: 'success',
      data: transformedData,
    };
  }

  async deleteModuleGroup(moduleGroupId: string, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const moduleGroup = await this.db
      .select({
        id: schema.academyModuleGroups.id,
        name: schema.academyModuleGroups.name,
        isDeleted: schema.academyModuleGroups.isDeleted,
      })
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    if (!moduleGroup.length) {
      throw new NotFoundException('Module group not found');
    }

    await this.db
      .delete(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    return {
      status: 'success',
    };
  }

  async getModuleGroup(academyId: string, modulegGroupId: string) {
    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const moduleGroup = await this.db
      .select()
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, modulegGroupId));

    if (!moduleGroup.length) {
      throw new NotFoundException('Module group not found');
    }

    return {
      status: 'success',
      data: { ...moduleGroup[0] },
    };
  }
  // MODULES
  async getModules(academyId: string, isDeleted: boolean) {
    const data = await this.db.query.academies.findFirst({
      where: (academies, { and, eq }) => and(eq(academies.id, academyId)),
      columns: {
        name: true,
      },
      with: {
        moduleGroups: {
          columns: {
            id: true,
            name: true,
          },
          orderBy: (moduleGroups, { asc }) => [asc(moduleGroups.order)],
          with: {
            modules: {
              columns: {
                createdAt: false,
                updatedAt: false,
                academyModuleGroupId: false,
              },
              orderBy: (modules, { asc }) => [asc(modules.order)],
              where: (modules, { eq }) => eq(modules.isDeleted, isDeleted),
              with: {
                user: {
                  columns: {
                    fullname: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const currentModules = [];

    data.moduleGroups.forEach((group) => {
      group.modules.forEach((module) => {
        const currentModule = {
          ...module,
          deletedBy:
            module.user && module.user.fullname ? module.user.fullname : null,
          moduleGroupName: group.name,
          moduleGroupId: group.id,
        };
        delete currentModule.user;
        currentModules.push(currentModule);
      });
    });
    return {
      status: 'success',
      data: [...currentModules],
    };
  }
  async addModulePicture(
    moduleId: string,
    modulePicture?: Express.Multer.File,
  ) {
    if (modulePicture) {
      const fileName = `${moduleId}-${Date.now()}`;
      const fileUrl = await this.supabaseService.uploadToPublicStorage(
        SupabaseBucket.MODULE_PICTURES,
        modulePicture,
        fileName,
      );

      return {
        status: 'success',
        data: {
          image_url: fileUrl,
        },
      };
    }
  }

  async getModule(
    academyId: string,
    moduleGroupId: string,
    moduleId: string,
    accessToken: string,
  ) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);
    const userRole = await this.usersService.getRole(user.username as string);

    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const moduleGroup = await this.db
      .select({ id: schema.academyModuleGroups.id })
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    if (!moduleGroup.length) {
      throw new NotFoundException('Module group not found');
    }

    const module = await this.db.query.academyModules.findFirst({
      where: (academyModules, { and, eq }) =>
        and(
          eq(academyModules.id, moduleId),
          eq(academyModules.isDeleted, false),
        ),
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.type === 'LESSON') {
      return {
        status: 'success',
        data: module,
      };
    }

    if (module.type === 'SUBMISSION') {
      const userSubmissions = await this.db.query.userSubmissions.findMany({
        where: (submissions, { eq, and }) =>
          and(
            eq(submissions.moduleId, moduleId),
            eq(submissions.userId, user.sub as string),
          ),
        orderBy: (submissions, { desc }) => [desc(submissions.createdAt)],
        with: {
          result: {
            columns: {
              isPassed: true,
            },
          },
        },
      });

      if (userSubmissions.length && userRole.role === 'user') {
        const allActiveSubmissionsInCurrentModule =
          await this.db.query.userSubmissions.findMany({
            where: (submissions, { eq, and }) =>
              and(
                eq(submissions.moduleId, moduleId),
                eq(submissions.status, 'PENDING'),
              ),
            columns: {
              id: true,
            },
            orderBy: (submissions, { asc }) => [asc(submissions.createdAt)],
          });

        const userSubmissionWaitingOrder =
          allActiveSubmissionsInCurrentModule.findIndex(
            (item) => item.id === userSubmissions[0].id,
          ) + 1;
        return {
          status: 'success',
          data: {
            ...module,
            submission: userSubmissions.length
              ? {
                  ...userSubmissions[0],
                  waitingOrder:
                    userSubmissions[0].status === 'REVIEW'
                      ? 0
                      : userSubmissionWaitingOrder,
                }
              : null,
          },
        };
      } else {
        return {
          status: 'success',
          data: {
            ...module,
          },
        };
      }
    }

    if (module.type === 'QUIZZ') {
      // const questionAmounts = await this.db.query.quizzes.findFirst({
      //   where: (quizzes, { eq }) => eq(quizzes.moduleId, module.id),
      //   columns: {
      //     questionAmounts: true,
      //   },
      // });
      const quizz = await this.db.query.quizzes.findFirst({
        where: (quizzes, { eq }) => eq(quizzes.moduleId, module.id),
        with: {
          questions: {
            where: (questions, { eq }) => eq(questions.isDeleted, false),
            orderBy: sql`random()`,
            // limit: questionAmounts ? questionAmounts.questionAmounts : 3,
            with: {
              answers: {
                where: (answers, { eq }) => eq(answers.isDeleted, false),
              },
            },
          },
        },
      });

      return {
        status: 'success',
        data: { ...module, quizz },
      };
    }
  }
  async addModule(createModuleDto: CreateModuleDto, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = this.jwtService.decode(accessToken);

    const module = {
      id: nanoid(20),
      ...createModuleDto,
    };

    await this.db.insert(schema.academyModules).values(module);
    await this.auditLogsService.create({
      actionType: ActionType.CREATE,
      entityName: module.name,
      entityType: EntityType.MODULE,
      entityId: module.id,
      userId: user.sub as string,
      createdAt: module.createdAt,
    });

    return {
      status: 'success',
      data: {
        moduleId: module.id,
      },
    };
  }

  async updateModule(
    academyId: string,
    moduleGroupId: string,
    moduleId: string,
    updateModuleDto: UpdateModuleDto,
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
      .where(eq(schema.academies.id, academyId));

    if (!academy.length) {
      throw new NotFoundException('Academy not found');
    }

    const moduleGroup = await this.db
      .select({ id: schema.academyModuleGroups.id })
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    if (!moduleGroup.length) {
      throw new NotFoundException('Module group not found');
    }
    const module = await this.db
      .select({
        id: schema.academyModules.id,
        name: schema.academyModules.name,
        isDeleted: schema.academyModules.isDeleted,
      })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    const payload = {
      ...updateModuleDto,
      ...(updateModuleDto.isDeleted && { deletedBy: user.sub as string }),
      ...(updateModuleDto.isDeleted === false && {
        deletedBy: null,
        deletedAt: null,
      }),
    };

    await this.db
      .update(schema.academyModules)
      .set(payload)
      .where(eq(schema.academyModules.id, moduleId));

    await this.auditLogsService.create({
      actionType:
        updateModuleDto.isDeleted === undefined
          ? ActionType.UPDATE
          : !updateModuleDto.isDeleted
            ? ActionType.UPDATE
            : ActionType.DELETE,
      entityName: updateModuleDto.name ? updateModuleDto.name : module[0].name,
      entityType: EntityType.MODULE,
      entityId: moduleId,
      userId: user.sub as string,
      createdAt: updateModuleDto.deletedAt
        ? updateModuleDto.deletedAt
        : updateModuleDto.updatedAt,
    });

    return {
      status: 'success',
    };
  }

  async deleteModule(moduleId: string, accessToken: string) {
    const isTokenValid = await this.jwtService.verifyAsync(accessToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    const module = await this.db
      .select({
        id: schema.academyModules.id,
        name: schema.academyModules.name,
        isDeleted: schema.academyModules.isDeleted,
      })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    await this.db
      .delete(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    return {
      status: 'success',
    };
  }

  // QUIZZES

  async getModuleQuizz(moduleId: string) {
    const quizz = await this.db.query.quizzes.findFirst({
      where: (quizzes, { eq }) => eq(quizzes.moduleId, moduleId),
      with: {
        questions: {
          where: (questions, { eq }) => eq(questions.isDeleted, false),
          orderBy: sql`random()`,
          // limit: questionAmounts ? questionAmounts.questionAmounts : 3,
          with: {
            answers: {
              where: (answers, { eq }) => eq(answers.isDeleted, false),
            },
          },
        },
      },
    });

    return {
      status: 'success',
      data: quizz,
    };
  }
  async createQuizz(moduleId: string, createQuizzDto: CreateQuizzDto) {
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    const quizz = await this.db
      .select({ id: schema.quizzes.id })
      .from(schema.quizzes)
      .where(eq(schema.quizzes.moduleId, moduleId));

    if (quizz.length) {
      return {
        status: 'success',
      };
    }

    const newQuizz = {
      id: nanoid(20),
      ...createQuizzDto,
    };

    await this.db.insert(schema.quizzes).values(newQuizz);
    return {
      status: 'success',
    };
  }

  async updateQuizz(moduleId: string, updateQuizzDto: UpdateQuizzDto) {
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    await this.db
      .update(schema.quizzes)
      .set(updateQuizzDto)
      .where(eq(schema.quizzes.moduleId, moduleId));

    return {
      status: 'success',
    };
  }

  // QUESTIONS

  async createQuizzQuestion(
    moduleId: string,
    quizzId: string,
    createQuizzQuestionDto: CreateQuizzQuestionDto,
  ) {
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    const quizz = await this.db
      .select({ id: schema.quizzes.id })
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, quizzId));

    if (!quizz.length) {
      throw new NotFoundException('Quizz not found');
    }

    // const updatePayload = createQuizzQuestionDto;
    // delete updatePayload.id;

    console.log(createQuizzQuestionDto);
    await this.db
      .insert(schema.quizzQuestions)
      .values(createQuizzQuestionDto)
      .onConflictDoUpdate({
        target: schema.quizzQuestions.id,
        set: createQuizzQuestionDto,
      });
    return {
      status: 'success',
    };
  }

  async updateQuizzQuestion(
    moduleId: string,
    quizzId: string,
    questionId: string,
    updateQuizzQuestionDto: UpdateQuizzQuestionDto,
  ) {
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    const quizz = await this.db
      .select({ id: schema.quizzes.id })
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, quizzId));

    if (!quizz.length) {
      throw new NotFoundException('Quizz not found');
    }

    const question = await this.db
      .select({ id: schema.quizzQuestions.id })
      .from(schema.quizzQuestions)
      .where(eq(schema.quizzQuestions.id, questionId));

    if (!question.length) {
      throw new NotFoundException('Question not found');
    }
    await this.db
      .update(schema.quizzQuestions)
      .set(updateQuizzQuestionDto)
      .where(eq(schema.quizzQuestions.id, questionId));

    return {
      status: 'success',
    };
  }
  // QUESTION ANSWERS
  async createQuestionAnswer(
    moduleId: string,
    quizzId: string,
    questionId: string,
    createQuestionAnswerDto: CreateQuestionAnswerDto[],
  ) {
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    const quizz = await this.db
      .select({ id: schema.quizzes.id })
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, quizzId));

    if (!quizz.length) {
      throw new NotFoundException('Quizz not found');
    }

    const question = await this.db
      .select({ id: schema.quizzQuestions.id })
      .from(schema.quizzQuestions)
      .where(eq(schema.quizzQuestions.id, questionId));

    if (!question.length) {
      throw new NotFoundException('Question not found');
    }

    const answerPromises = createQuestionAnswerDto.map((answer) =>
      this.db
        .insert(schema.quizzAnswerChoices)
        .values(answer)
        .onConflictDoUpdate({
          target: schema.quizzAnswerChoices.id,
          set: answer,
        }),
    );

    await Promise.all(answerPromises);

    return {
      status: 'success',
    };
  }
  async updateQuestionAnswer(
    moduleId: string,
    quizzId: string,
    questionId: string,
    answerId: string,
    updateQuestionAnswerDto: UpdateQuestionAnswerDto,
  ) {
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module.length) {
      throw new NotFoundException('Module not found');
    }

    const quizz = await this.db
      .select({ id: schema.quizzes.id })
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, quizzId));

    if (!quizz.length) {
      throw new NotFoundException('Quizz not found');
    }

    const question = await this.db
      .select({ id: schema.quizzQuestions.id })
      .from(schema.quizzQuestions)
      .where(eq(schema.quizzQuestions.id, questionId));

    if (!question.length) {
      throw new NotFoundException('Question not found');
    }

    await this.db
      .update(schema.quizzAnswerChoices)
      .set(updateQuestionAnswerDto)
      .where(eq(schema.quizzAnswerChoices.id, answerId));

    return {
      status: 'success',
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} academy`;
  // }

  // update(id: number, updateAcademyDto: UpdateAcademyDto) {
  //   return `This action updates a #${id} academy`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} academy`;
  // }
}
