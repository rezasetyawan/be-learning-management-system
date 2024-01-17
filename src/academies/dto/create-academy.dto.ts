import { IsNotEmpty } from 'class-validator';

export class CreateAcademyDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  isPublished: boolean;
  isDeleted: boolean;
  deletedAt?: string;
}
