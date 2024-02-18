import { IsNotEmpty } from 'class-validator';

export class CreateAcademyApplicationDto {
  @IsNotEmpty()
  academyId: string;
}
