import { IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  role: 'user' | 'admin' | 'superadmin';
  @IsNotEmpty()
  createdAt: string;
}
