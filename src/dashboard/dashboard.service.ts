import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { count, eq } from 'drizzle-orm';
import { PG_CONNECTION } from '../../src/constants';
import {
  getCurrentMonthDetails,
  getTimestampOfFirstDayOfYear,
  getTimestampOfLastDayOfYear,
} from 'utils';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async get() {
    const { firstDayOfMonthTimestamp } = getCurrentMonthDetails();
    const totalUserCounts = await this.db
      .select({ value: count(schema.users.id) })
      .from(schema.users);

    const currentMonthUserCounts = await this.db.query.users.findMany({
      columns: {
        id: true,
      },
      where: (users, { gte, and }) =>
        and(gte(users.createdAt, firstDayOfMonthTimestamp.toString())),
    });

    const totalAcademyCounts = await this.db
      .select({ value: count(schema.academies.id) })
      .from(schema.academies);

    const unactiveAcademyCounts = await this.db
      .select({ value: count(schema.academies.id) })
      .from(schema.academies)
      .where(eq(schema.academies.isPublished, false));

    const activeAcademyCounts = await this.db
      .select({ value: count(schema.academies.id) })
      .from(schema.academies)
      .where(eq(schema.academies.isPublished, true));

    const academiesData = await this.db.query.academies.findMany({
      columns: {
        name: true,
        id: true,
        coverImageUrl: true,
      },
      where: (academies, { and, eq }) =>
        and(eq(academies.isDeleted, false), eq(academies.isPublished, true)),
      with: {
        academyApplications: {
          where: (applications, { eq }) => eq(applications.status, 'APPROVED'),
          columns: {
            id: true,
          },
        },
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
      limit: 5,
    });

    const popularAcademies = academiesData.map((academy) => {
      const publishedModuleIds = academy.moduleGroups.flatMap(({ modules }) =>
        modules.map(({ id }) => id),
      );

      return {
        id: academy.id,
        name: academy.name,
        coverImageUrl: academy.coverImageUrl,
        joinedUserCount: academy.academyApplications.length,
        moduleCount: publishedModuleIds.length,
      };
    });

    // const popularAcademies = await this.db.query.academies.findMany({
    //   columns: {
    //     name: true,
    //     id: true,
    //     coverImageUrl: true,
    //   },
    //   limit: 5,
    //   where: (academies, { and, eq }) =>
    //     and(eq(academies.isPublished, true), eq(academies.isDeleted, false)),
    // });

    const currentYear = new Date().getFullYear();
    const currentYearUsers = await this.db.query.users.findMany({
      columns: {
        createdAt: true,
        username: true,
      },
      where: (users, { gte, lte, and }) =>
        and(
          gte(
            users.createdAt,
            getTimestampOfFirstDayOfYear(currentYear).toString(),
          ),
          lte(
            users.createdAt,
            getTimestampOfLastDayOfYear(currentYear).toString(),
          ),
        ),
    });

    const unReviewedSubmission = await this.db.query.userSubmissions.findMany({
      where: (submissions, { eq }) => eq(submissions.status, 'PENDING'),
    });

    return {
      data: {
        userCounts: totalUserCounts[0].value,
        currentMonthUserCounts: currentMonthUserCounts.length,
        academyCounts: totalAcademyCounts[0].value,
        popularAcademies,
        currentYearUsers,
        unReviewedSubmissionCounts: unReviewedSubmission.length,
        unactiveAcademyCounts: unactiveAcademyCounts[0].value,
        activeAcademyCounts: activeAcademyCounts[0].value,
      },
    };
  }
}
