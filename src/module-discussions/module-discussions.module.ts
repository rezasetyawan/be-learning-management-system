import { Module } from '@nestjs/common';
import { ModuleDiscussionsService } from './module-discussions.service';
import { ModuleDiscussionsController } from './module-discussions.controller';
import { DrizzleModule } from '../../src/drizzle/drizzle.module';

@Module({
  controllers: [ModuleDiscussionsController],
  providers: [ModuleDiscussionsService],
  imports: [DrizzleModule],
})
export class ModuleDiscussionsModule {}
