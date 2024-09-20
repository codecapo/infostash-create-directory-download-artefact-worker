import { Test, TestingModule } from '@nestjs/testing';
import { TransactionalInboxOutboxService } from './transactional-inbox-outbox.service';

describe('TransactionalInboxOutboxService', () => {
  let service: TransactionalInboxOutboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionalInboxOutboxService],
    }).compile();

    service = module.get<TransactionalInboxOutboxService>(
      TransactionalInboxOutboxService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
