import { Test, TestingModule } from '@nestjs/testing';
import { UserSubmissionsController } from './user-submissions.controller';
import { UserSubmissionsService } from './user-submissions.service';

describe('UserSubmissionsController', () => {
  let controller: UserSubmissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSubmissionsController],
      providers: [UserSubmissionsService],
    }).compile();

    controller = module.get<UserSubmissionsController>(UserSubmissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
