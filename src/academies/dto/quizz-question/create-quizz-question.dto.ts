import { IsNotEmpty } from 'class-validator';

export class CreateQuizzQuestionDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  quizzId: string;
  @IsNotEmpty()
  text: string;
  isDeleted: boolean;
  deletedAt?: string;
}
