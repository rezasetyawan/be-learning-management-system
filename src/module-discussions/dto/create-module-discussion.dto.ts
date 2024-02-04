import { IsNotEmpty } from 'class-validator';

export class CreateModuleDiscussionDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  body: string;
  @IsNotEmpty()
  moduleId: string;
  @IsNotEmpty()
  isSolved: boolean;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  academyId: string;
}
