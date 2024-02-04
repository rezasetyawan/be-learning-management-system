import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleDiscussionDto } from './create-module-discussion.dto';

export class UpdateModuleDiscussionDto extends PartialType(
  CreateModuleDiscussionDto,
) {}
