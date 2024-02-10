import { Controller } from '@nestjs/common';
import { UserSubmissionsService } from './user-submissions.service';

@Controller('user-submissions')
export class UserSubmissionsController {
  constructor(private readonly userSubmissionsService: UserSubmissionsService) {}
}
