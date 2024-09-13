import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {
    InboxProcessingLog,
    InboxProcessingLogDocument,
} from '@app/transactional-inbox-outbox/inbox-processing-log.schema';
import { ClientSession, Model, Types } from "mongoose";
import {
    OutboxProcessingLog,
    OutboxProcessingLogDocument
} from "@app/transactional-inbox-outbox/outbox-processing-log.schema";
import {ProcessingState} from "@app/transactional-inbox-outbox/processing-state.enum";

@Injectable()
export class TransactionalInboxOutboxRepo {

    private logger = new Logger(TransactionalInboxOutboxRepo.name);

    constructor(
        @InjectModel(InboxProcessingLog.name) private inboxProcessingLogModel: Model<InboxProcessingLogDocument>,
        @InjectModel(OutboxProcessingLog.name) private outboxProcessingLogModel: Model<OutboxProcessingLogDocument>,
    ) {
    }

    public async createCreateInboxProcessingLogRequest(
        inboxProcessingLog: InboxProcessingLog,
    ) {
        return await this.inboxProcessingLogModel.create(inboxProcessingLog);
    }

    // processing states= UNPROCESSED, PROCESSING_STARTED, FILE_DOWNLOADED, SPLIT_OUT_PAGES, TRANSFORMED_TO_IMAGES, PROCESSING_END

    public async updateProcessingLogState(processingLogId: string, processingState: string, session: ClientSession) {

        const processingLogRequestOid = new Types.ObjectId(processingLogId);
        const update = await this.inboxProcessingLogModel.findOneAndUpdate({_id: processingLogRequestOid}, {
            $push: {processingStage: processingState}
        }).session(session)

        return update
    }

    public async getInboxProcessingLogRequest(
        infostashId: string,
        artefactId: string,
    ) {
        const infostashOid = new Types.ObjectId(infostashId);
        const artefactOid = new Types.ObjectId(artefactId);
        const get = await this.inboxProcessingLogModel.findOne({
            infostashId: infostashOid,
            artefactId: artefactOid,
        });

        return get;
    }

    public async getUnprocessedInboxProcessingLogRequest(): Promise<InboxProcessingLogDocument> {

        const query = {
            $and: [
                { processingStage: ProcessingState.UNPROCESSED },
                { $expr: { $eq: [{ $size: "$processingStage" }, 1] } }
            ]
        };

        const findAllNoFilter = await this.inboxProcessingLogModel.find(query)
        return findAllNoFilter[0]
    }

    public async isInboxProcessingLogIsPresentInOutboxProcessingLogAndAllStatesArePresentInProcessingStage(inboxProcessingLogRequestId: string) {
        const outboxItems = await this.outboxProcessingLogModel.find({inboxProcessingLogRequestId: new Types.ObjectId(inboxProcessingLogRequestId)});
        if (outboxItems.length < 1) {
            this.logger.debug(`Got new processing log request with id: ${inboxProcessingLogRequestId}`)
            return true
        } else {
            throw new Error('Media Artefact is already processed')
        }
    }
}
