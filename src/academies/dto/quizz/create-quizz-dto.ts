import { IsNotEmpty } from 'class-validator';

export class CreateQuizzDto {
  @IsNotEmpty()
  moduleId: string;
  duration: number;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  questionAmounts: number;
}
