import { IsNotEmpty } from 'class-validator';

export class CreateModuleGroupDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  academyId: string;
  @IsNotEmpty()
  isPublished: boolean;
  @IsNotEmpty()
  order: number;
  isDeleted: boolean;
  deletedAt?: string;
}
