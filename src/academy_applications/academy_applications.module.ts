import { Module } from '@nestjs/common';
import { AcademyApplicationsService } from './academy_applications.service';
import { AcademyApplicationsController } from './academy_applications.controller';

@Module({
  controllers: [AcademyApplicationsController],
  providers: [AcademyApplicationsService],
})
export class AcademyApplicationsModule {}
