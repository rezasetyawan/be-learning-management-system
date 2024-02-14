import { IsNotEmpty } from 'class-validator';

export class CreateUserSubmissionDto {
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  moduleId: string;
  note: string;
  @IsNotEmpty()
  academyId: string;
  status?: 'PENDING' | 'REVIEW' | 'REVIEWED';
}
