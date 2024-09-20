import { Injectable, Logger } from '@nestjs/common';
import { TransactionalInboxOutboxRepo } from '@app/transactional-inbox-outbox/transactional-inbox-outbox.repo';
import { InboxProcessingLog } from '@app/transactional-inbox-outbox/inbox-processing-log.schema';
import { ClientSession, Types } from 'mongoose';

export class CreateProcessingLogRequest {
  infostashId: string;
  artefactId: string;
  uploadLocation: string;
  folderLocation: string;
  newFilename: string;
}

@Injectable()
export class TransactionalInboxOutboxService {
  private logger = new Logger(TransactionalInboxOutboxService.name);

  constructor(
    private readonly transactionalInboxOutboxRepo: TransactionalInboxOutboxRepo,
  ) {}

  public async createInitialProcessingLogRequest(
    createProcessingLogRequest: CreateProcessingLogRequest,
  ): Promise<InboxProcessingLog> {
    try {
      const inboxProcessingLog: InboxProcessingLog = {
        artefactId: new Types.ObjectId(createProcessingLogRequest.artefactId),
        uploadLocation: createProcessingLogRequest.uploadLocation,
        folderLocation: createProcessingLogRequest.folderLocation,
        infostashId: new Types.ObjectId(createProcessingLogRequest.infostashId),
        newFilename: createProcessingLogRequest.newFilename,
        processingStage: ['UNPROCESSED'],
      };

      const createdLog =
        await this.transactionalInboxOutboxRepo.createCreateInboxProcessingLogRequest(
          inboxProcessingLog,
        );

      this.logger.log(
        `New processing log request added for infostashId ${createProcessingLogRequest.infostashId} and artefactId ${createProcessingLogRequest.artefactId}`,
        { inboxProcessingLog: createdLog },
      );

      return createdLog;
    } catch (error) {
      this.logger.error('Error creating initial processing log request', {
        error:
          error instanceof Error
            ? error.message
            : 'Did not create initial processing log request',
        createProcessingLogRequest,
      });
      throw error;
    }
  }

  public async updateProcessingLogState(
    processingLogId: string,
    processingState: string,
    session: ClientSession,
  ): Promise<InboxProcessingLog | null> {
    try {
      const updatedProcessingLog =
        await this.transactionalInboxOutboxRepo.updateProcessingLogState(
          processingLogId,
          processingState,
          session,
        );

      if (!updatedProcessingLog) {
        this.logger.warn(
          `Processing log with ID ${processingLogId} not found or not updated.`,
        );
        return null;
      }

      return updatedProcessingLog;
    } catch (error) {
      this.logger.error(
        `Error updating processing log state: ${error instanceof Error ? error.message : 'Did not update processing log state'}`,
      );
      throw error;
    }
  }

  public async getInboxUnprocessedLogRequest() {
    const processingLogRequest =
      await this.transactionalInboxOutboxRepo.getUnprocessedInboxProcessingLogRequest();

    if (processingLogRequest) {
      const isNotProcessed =
        await this.transactionalInboxOutboxRepo.isInboxProcessingLogIsPresentInOutboxProcessingLogAndAllStatesArePresentInProcessingStage(
          processingLogRequest._id.toHexString(),
        );
      if (isNotProcessed) {
        return processingLogRequest;
      } else {
        return;
      }
    } else {
      return;
    }
  }
}
