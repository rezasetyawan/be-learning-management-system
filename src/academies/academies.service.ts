import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademyDto } from './dto/create-academy.dto';
// import { UpdateAcademyDto } from './dto/update-academy.dto';
import { PG_CONNECTION } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { SupabaseService } from 'lib/supabase.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { eq } from 'drizzle-orm';
import { UpdateModuleGroupDto } from './dto/update-module-group.dto';
import { nanoid } from 'nanoid';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { Express } from 'express';
import { SupabaseBucket } from 'src/enums/supabase-bucket-enum';
import { CreateModuleGroupDto } from './dto/create-module-group.dto';
import { CreateModuleDto } from './dto/create-module.dto';

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

    return {
      status: 'success',
      data: module,
    };
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
