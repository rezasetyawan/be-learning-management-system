import { IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  fullname: string;
  @IsNotEmpty()
  about: string;
}
