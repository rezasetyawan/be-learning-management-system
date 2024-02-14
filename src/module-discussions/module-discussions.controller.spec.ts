import { Test, TestingModule } from '@nestjs/testing';
import { ModuleDiscussionsController } from './module-discussions.controller';
import { ModuleDiscussionsService } from './module-discussions.service';

describe('ModuleDiscussionsController', () => {
  let controller: ModuleDiscussionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuleDiscussionsController],
      providers: [ModuleDiscussionsService],
    }).compile();

    controller = module.get<ModuleDiscussionsController>(
      ModuleDiscussionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
