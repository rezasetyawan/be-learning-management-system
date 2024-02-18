import { Test, TestingModule } from '@nestjs/testing';
import { AcademyApplicationsService } from './academy_applications.service';

describe('AcademyApplicationsService', () => {
  let service: AcademyApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademyApplicationsService],
    }).compile();

    service = module.get<AcademyApplicationsService>(AcademyApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
