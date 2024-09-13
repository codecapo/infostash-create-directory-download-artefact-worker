import { Module } from '@nestjs/common';
import { TransactionalInboxOutboxService } from './transactional-inbox-outbox.service';
import { TransactionalInboxOutboxRepo } from '@app/transactional-inbox-outbox/transactional-inbox-outbox.repo';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InboxProcessingLog,
  InboxProcessingLogSchema,
} from '@app/transactional-inbox-outbox/inbox-processing-log.schema';
import {
  OutboxProcessingLog,
  OutboxProcessingLogSchema
} from "@app/transactional-inbox-outbox/outbox-processing-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InboxProcessingLog.name, schema: InboxProcessingLogSchema },
      { name: OutboxProcessingLog.name, schema: OutboxProcessingLogSchema },
    ]),
  ],
  providers: [TransactionalInboxOutboxService, TransactionalInboxOutboxRepo],
  exports: [TransactionalInboxOutboxService, TransactionalInboxOutboxRepo],
})
export class TransactionalInboxOutboxModule {}
