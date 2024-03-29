import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AcademiesModule } from './academies/academies.module';
import { UserQuizzHistoriesModule } from './user-quizz-histories/user-quizz-histories.module';
import { ModuleDiscussionsModule } from './module-discussions/module-discussions.module';
import { AuditLogService } from './audit-log/audit-log.service';
import { AuditLogModule } from './audit-log/audit-log.module';
import { UserSubmissionsModule } from './user-submissions/user-submissions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AcademyApplicationsModule } from './academy_applications/academy_applications.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalHeaderInterceptor } from './global-header/global-header.interceptor';

@Module({
  imports: [
    DrizzleModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProfileModule,
    AcademiesModule,
    UserQuizzHistoriesModule,
    ModuleDiscussionsModule,
    AuditLogModule,
    UserSubmissionsModule,
    DashboardModule,
    AcademyApplicationsModule,
    UserProgressModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuditLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalHeaderInterceptor,
    },
  ],
})
export class AppModule {}
