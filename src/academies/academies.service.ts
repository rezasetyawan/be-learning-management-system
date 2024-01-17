import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademyDto } from './dto/create-academy.dto';
// import { UpdateAcademyDto } from './dto/update-academy.dto';
import { PG_CONNECTION } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { SupabaseService } from 'lib/supabase.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { eq, sql } from 'drizzle-orm';
import { UpdateModuleGroupDto } from './dto/update-module-group.dto';
import { nanoid } from 'nanoid';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { Express } from 'express';
import { SupabaseBucket } from 'src/enums/supabase-bucket-enum';
import { CreateModuleGroupDto } from './dto/create-module-group.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateQuizzDto } from './dto/quizz/create-quizz-dto';
import { CreateQuizzQuestionDto } from './dto/quizz-question/create-quizz-question.dto';
import { CreateQuestionAnswerDto } from './dto/quizz-question-answer/create-question-answer.dto';
import UpdateQuestionAnswerDto from './dto/quizz-question-answer/update-question-answer.dto';
import UpdateQuizzDto from './dto/quizz/update-quizz.dto';

@Injectable()
export class AcademiesService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private readonly supabaseService: SupabaseService,
  ) {}

  // ACADEMIES
  async create(createAcademyDto: CreateAcademyDto) {
    const academy = {
      id: nanoid(20),
      ...createAcademyDto,
    };
    await this.db.insert(schema.academies).values(academy);
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
    academyCoverPicture?: Express.Multer.File,
  ) {
    const { name, updatedAt, description, isPublished } = updateAcademyDto;

    if (name || updatedAt || description || isPublished !== undefined) {
      await this.db
        .update(schema.academies)
        .set(updateAcademyDto)
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

    return {
      status: 'success',
    };
  }

  async findAll() {
    const data = await this.db.query.academies.findMany({
      where: (academies, { eq }) => eq(academies.isDeleted, false),
    });
    return data;
  }

  async findOne(id: string) {
    const data = await this.db.query.academies.findFirst({
      where: (academies, { and, eq }) =>
        and(eq(academies.id, id), eq(academies.isDeleted, false)),
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

    return {
      status: 'success',
      data: data,
    };
  }

  // MODULE GROUPS
  async addModuleGroup(createModuleGroupDto: CreateModuleGroupDto) {
    const moduleGroup = {
      id: nanoid(20),
      ...createModuleGroupDto,
    };
    await this.db.insert(schema.academyModuleGroups).values(moduleGroup);
    return {
      status: 'success',
      data: {
        moduleGroupId: moduleGroup.id,
      },
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
  async updateModuleGroup(
    academyId: string,
    moduleGroupId: string,
    updateModuleGroupDto: UpdateModuleGroupDto,
  ) {
    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy) {
      throw new NotFoundException('Academy not found');
    }

    const moduleGroup = await this.db
      .select({ id: schema.academyModuleGroups.id })
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    if (!moduleGroup) {
      throw new NotFoundException('Module group not found');
    }

    await this.db
      .update(schema.academyModuleGroups)
      .set(updateModuleGroupDto)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    return {
      status: 'success',
    };
  }

  // MODULES

  async getModule(academyId: string, moduleGroupId: string, moduleId: string) {
    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy) {
      throw new NotFoundException('Academy not found');
    }

    const moduleGroup = await this.db
      .select({ id: schema.academyModuleGroups.id })
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    if (!moduleGroup) {
      throw new NotFoundException('Module group not found');
    }

    const module = await this.db.query.academyModules.findFirst({
      where: (academyModules, { and, eq }) =>
        and(
          eq(academyModules.id, moduleId),
          eq(academyModules.isDeleted, false),
        ),
    });

    if (module.type === 'LESSON' || module.type === 'SUBMISSION') {
      return {
        status: 'success',
        data: module,
      };
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
  async addModule(createModuleDto: CreateModuleDto) {
    const module = {
      id: nanoid(20),
      ...createModuleDto,
    };

    console.log(module);

    await this.db.insert(schema.academyModules).values(module);

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
  ) {
    const academy = await this.db
      .select({ id: schema.academies.id })
      .from(schema.academies)
      .where(eq(schema.academies.id, academyId));

    if (!academy) {
      throw new NotFoundException('Academy not found');
    }

    const moduleGroup = await this.db
      .select({ id: schema.academyModuleGroups.id })
      .from(schema.academyModuleGroups)
      .where(eq(schema.academyModuleGroups.id, moduleGroupId));

    if (!moduleGroup) {
      throw new NotFoundException('Module group not found');
    }
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    await this.db
      .update(schema.academyModules)
      .set(updateModuleDto)
      .where(eq(schema.academyModules.id, moduleId));

    return {
      status: 'success',
    };
  }

  // QUIZZES

  async createQuizz(moduleId: string, createQuizzDto: CreateQuizzDto) {
    const module = await this.db
      .select({ id: schema.academyModules.id })
      .from(schema.academyModules)
      .where(eq(schema.academyModules.id, moduleId));

    if (!module) {
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

    if (!module) {
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
