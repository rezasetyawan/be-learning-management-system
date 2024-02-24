import { IsNotEmpty } from 'class-validator';

export class UpdateAcademyApplicationDto {
  @IsNotEmpty()
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
