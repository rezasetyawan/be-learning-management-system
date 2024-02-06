import { IsNotEmpty } from 'class-validator';

export class CreateDiscussionReplyDto {
  @IsNotEmpty()
  discussionId: string;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  body: string;
}
