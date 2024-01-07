import { Test, TestingModule } from '@nestjs/testing';
import { AcademiesController } from './academies.controller';
import { AcademiesService } from './academies.service';

describe('AcademiesController', () => {
  let controller: AcademiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademiesController],
      providers: [AcademiesService],
    }).compile();

    controller = module.get<AcademiesController>(AcademiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
