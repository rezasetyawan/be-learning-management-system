import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionAnswerDto } from './create-question-answer.dto';

export default class UpdateQuestionAnswerDto extends PartialType(
  CreateQuestionAnswerDto,
) {}
