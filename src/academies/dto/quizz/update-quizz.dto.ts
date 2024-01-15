import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizzDto } from './create-quizz-dto';

export default class UpdateQuizzDto extends PartialType(CreateQuizzDto) {}
