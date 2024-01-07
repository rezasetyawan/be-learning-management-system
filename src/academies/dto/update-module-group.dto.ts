import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleGroupDto } from './create-module-group.dto';

export class UpdateModuleGroupDto extends PartialType(CreateModuleGroupDto) {}
