import { Test, TestingModule } from '@nestjs/testing';
import { UserSubmissionsService } from './user-submissions.service';

describe('UserSubmissionsService', () => {
  let service: UserSubmissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSubmissionsService],
    }).compile();

    service = module.get<UserSubmissionsService>(UserSubmissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
