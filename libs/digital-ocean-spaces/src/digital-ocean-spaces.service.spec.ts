import { Test, TestingModule } from '@nestjs/testing';
import { DigitalOceanSpacesService } from './digital-ocean-spaces.service';

describe('DigitalOceanSpacesService', () => {
  let service: DigitalOceanSpacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DigitalOceanSpacesService],
    }).compile();

    service = module.get<DigitalOceanSpacesService>(DigitalOceanSpacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
