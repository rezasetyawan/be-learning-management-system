import { Test, TestingModule } from '@nestjs/testing';
import { AcademiesService } from './academies.service';

describe('AcademiesService', () => {
  let service: AcademiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademiesService],
    }).compile();

    service = module.get<AcademiesService>(AcademiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
