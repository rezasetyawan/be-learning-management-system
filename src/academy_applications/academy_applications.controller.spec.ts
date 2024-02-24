import { Test, TestingModule } from '@nestjs/testing';
import { AcademyApplicationsController } from './academy_applications.controller';
import { AcademyApplicationsService } from './academy_applications.service';

describe('AcademyApplicationsController', () => {
  let controller: AcademyApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademyApplicationsController],
      providers: [AcademyApplicationsService],
    }).compile();

    controller = module.get<AcademyApplicationsController>(AcademyApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
