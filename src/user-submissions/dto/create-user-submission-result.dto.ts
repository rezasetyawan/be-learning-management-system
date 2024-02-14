import { IsNotEmpty } from 'class-validator';

export class CreateUserSubmissionResultDto {
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  reviewerNote: string;
  score: number;
  @IsNotEmpty()
  isPassed: boolean;
}
