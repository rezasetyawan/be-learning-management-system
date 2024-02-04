import { Test, TestingModule } from '@nestjs/testing';
import { ModuleDiscussionsService } from './module-discussions.service';

describe('ModuleDiscussionsService', () => {
  let service: ModuleDiscussionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModuleDiscussionsService],
    }).compile();

    service = module.get<ModuleDiscussionsService>(ModuleDiscussionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
