import { IsNotEmpty } from 'class-validator';
class CreateUserQuizzAnswerHistories {
  @IsNotEmpty()
  questionId: string;
  @IsNotEmpty()
  answerId: string;
}

export class CreateUserQuizzHistoryDto {
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  score: number;
  @IsNotEmpty()
  moduleId: string;
  answers: CreateUserQuizzAnswerHistories[];
}
