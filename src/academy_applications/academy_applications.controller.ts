import { Controller } from '@nestjs/common';
import { AcademyApplicationsService } from './academy_applications.service';

@Controller('academy-applications')
export class AcademyApplicationsController {
  constructor(private readonly academyApplicationsService: AcademyApplicationsService) {}
}
