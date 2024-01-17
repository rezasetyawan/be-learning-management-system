import { IsNotEmpty } from 'class-validator';

export class CreateModuleDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  academyModuleGroupId: string;
  @IsNotEmpty()
  type: 'LESSON' | 'QUIZZ' | 'SUBMISSION';
  @IsNotEmpty()
  content: string;
  @IsNotEmpty()
  isPublished: boolean;
  @IsNotEmpty()
  order: number;
  isDeleted: boolean;
  deletedAt?: string;
}
