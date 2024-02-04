import { Test, TestingModule } from '@nestjs/testing';
import { UserQuizzHistoriesService } from './user-quizz-histories.service';

describe('UserQuizzHistoriesService', () => {
  let service: UserQuizzHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserQuizzHistoriesService],
    }).compile();

    service = module.get<UserQuizzHistoriesService>(UserQuizzHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
