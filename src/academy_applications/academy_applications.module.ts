import { Module } from '@nestjs/common';
import { AcademyApplicationsService } from './academy_applications.service';
import { AcademyApplicationsController } from './academy_applications.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  controllers: [AcademyApplicationsController],
  providers: [AcademyApplicationsService],
  imports: [DrizzleModule],
})
export class AcademyApplicationsModule {}
