import { PartialType } from '@nestjs/mapped-types';
import { CreateUserQuizzHistoryDto } from './create-user-quizz-history.dto';

export class UpdateUserQuizzHistoryDto extends PartialType(
  CreateUserQuizzHistoryDto,
) {}
