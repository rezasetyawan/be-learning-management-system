import { Controller } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';

@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}
}
