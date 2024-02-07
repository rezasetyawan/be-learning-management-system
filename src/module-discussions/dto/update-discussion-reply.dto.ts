import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscussionReplyDto } from './create-dicussion-reply.dto';

export class UpdateDiscussionReplyDto extends PartialType(
  CreateDiscussionReplyDto,
) {}
