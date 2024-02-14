import { Test, TestingModule } from '@nestjs/testing';
import { UserQuizzHistoriesController } from './user-quizz-histories.controller';
import { UserQuizzHistoriesService } from './user-quizz-histories.service';

describe('UserQuizzHistoriesController', () => {
  let controller: UserQuizzHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserQuizzHistoriesController],
      providers: [UserQuizzHistoriesService],
    }).compile();

    controller = module.get<UserQuizzHistoriesController>(
      UserQuizzHistoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
