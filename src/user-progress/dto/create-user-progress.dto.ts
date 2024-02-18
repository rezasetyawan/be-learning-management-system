import { IsNotEmpty } from 'class-validator';

export class CreateUserProgressDto {
  @IsNotEmpty()
  academyId: string;
  @IsNotEmpty()
  moduleId: string;
  @IsNotEmpty()
  isCompleted: boolean;
}
