import { IsNotEmpty } from 'class-validator';

export class CreateUserLastReadDto {
  @IsNotEmpty()
  academyId: string;
  @IsNotEmpty()
  moduleGroupId: string;
  @IsNotEmpty()
  moduleId: string;
}
