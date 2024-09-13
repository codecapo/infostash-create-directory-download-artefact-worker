import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {RabbitMQService} from "@app/rabbit-mq";
import {AppMapper} from "./app.mapper";
import {CreateDirectoryDownloadArtefact} from "./app.messages";
import {TransactionalInboxOutboxService} from "@app/transactional-inbox-outbox";
import {ProcessingState} from "@app/transactional-inbox-outbox/processing-state.enum";
import {AppService} from "./app.service";
import {AppProcessingState} from "./app.processing-state.enum";
import { AppTransactionService } from "./app.transaction.service";

@Injectable()
export class AppWorker implements OnModuleInit {
    private logger = new Logger(AppWorker.name)

    private queueName: string = process.env.QN_CREATE_DIRECTORY_DOWNLOAD_ARTEFACT

    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly transactionalInboxOutboxService: TransactionalInboxOutboxService,
        private readonly appService: AppService,
        private readonly appMapper: AppMapper,
        private readonly appTransactionService: AppTransactionService,
    ) {
    }

    async onModuleInit() {
        // will start consuming on application startup
        await this.setupMessageConsumer();
    }

    async setupMessageConsumer() {
        try {
            await this.rabbitMQService.consumeMessages(this.queueName, async (msg) => {
                if (msg !== null) {
                    // Process the message here
                    const task = this.appMapper.mapMessageToCreateDirectoryDownloadArtefact(msg.content.toString())

                    await this.processTask(task);
                }
            });
            this.logger.debug(`Started consuming messages from queue: ${this.queueName}`);
        } catch (e) {
            this.logger.error(`Problem with consuming message: ${e}`)
        }
    }

    // check this https://claude.ai/chat/8297051e-ebda-4093-8871-e8743dcc8ecc
    // wrap the service methods into a transaction so it rollbacks all the db state if an error is thrown
    private async processTask(task: CreateDirectoryDownloadArtefact) {
        return await this.appTransactionService.executeTransaction(async (session) => {
            try {
                const  isValid = await this.transactionalInboxOutboxService.getInboxUnprocessedLogRequest()
                if (!isValid) {
                    throw new Error('Processing log request was previously processed')
                } else {
                    await this.transactionalInboxOutboxService.updateProcessingLogState(task.processingLogRequestId, ProcessingState.PROCESSING_STARTED, session)
                    this.logger.debug(`Processing started for task with id: ${task.processingLogRequestId} with infostash id ${task.infostashId} and with artefact id: ${task.mediaArtefactId}`);
                    const result = await this.appService.createPdfDirectoryAndDownload(task.mediaArtefactId, task.folderLocation, task.newfileName, task.uploadLocation)
                    if (result.fileDownloaded) {
                        await this.transactionalInboxOutboxService.updateProcessingLogState(task.processingLogRequestId, AppProcessingState.PDF_DOWNLOADED, session)
                        this.logger.debug(`Processing ended for task with id: ${task.processingLogRequestId} with infostash id ${task.infostashId} and with artefact id: ${task.mediaArtefactId}`);
                    }
                }
            } catch (e) {
                this.logger.error(`Problem Processing Task - ${e}`)
                return e
            }
        });
    }


}