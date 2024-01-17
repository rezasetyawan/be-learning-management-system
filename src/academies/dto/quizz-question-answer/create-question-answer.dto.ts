import { IsNotEmpty } from 'class-validator';

export class CreateQuestionAnswerDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  questionId: string;
  @IsNotEmpty()
  text: string;
  @IsNotEmpty()
  isCorrect: boolean;
  isDeleted: boolean;
  deletedAt?: string;
}
