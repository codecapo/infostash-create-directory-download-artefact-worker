import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '@app/rabbit-mq';
import { AppMapper } from './app.mapper';
import { AppService } from './app.service';
import { TaskProcessingMessage } from '@app/infostash-message-types/workflow.messaging';
import { TaskProcessingRepo } from '../libs/workflow/repo/task-processing.repo';
import { UserRepo } from '@app/domain/user/repo/user.repo';
import { randomUUID } from 'node:crypto';
import { WorkflowProcessingLogRepo } from '../libs/workflow/repo/workflow-processing-log.repo';
import { MongodbService } from '@app/mongodb';
import { ClientSession } from 'mongodb';
import { CreateDirectoryDownloadArtefactTaskProcessedMessageType } from '@app/infostash-message-types/create-directory-download-artefact.task.processed.message-type';

@Injectable()
export class AppWorker implements OnModuleInit {
  private readonly logger = new Logger(AppWorker.name);
  private readonly taskQueueName =
    process.env.QN_CREATE_DIRECTORY_DOWNLOAD_ARTEFACT_TASK;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly appService: AppService,
    private readonly appMapper: AppMapper,
    private readonly taskProcessingRepo: TaskProcessingRepo,
    private readonly workflowProcessingLogRepo: WorkflowProcessingLogRepo,
    private readonly userRepo: UserRepo,
    private readonly mongodbService: MongodbService,
  ) {}

  async onModuleInit() {
    await this.setupMessageConsumer();
  }

  private async setupMessageConsumer() {
    try {
      await this.rabbitMQService.consumeMessages(
        this.taskQueueName,
        this.handleMessage.bind(this),
      );
      this.logger.debug(
        `Started consuming messages from queue: ${this.taskQueueName}`,
      );
    } catch (error) {
      this.logger.error(`Problem with consuming message: ${error}`);
    }
  }

  private async handleMessage(msg: any, ack: () => void) {
    if (!msg) return;

    let clientSession: ClientSession | null = null;

    try {
      const mongoConnectionInstance =
        await this.mongodbService.mongoConnection();
      clientSession = await mongoConnectionInstance.startSession();
      clientSession.startTransaction();

      const task = this.appMapper.mapMessageToCreateDirectoryDownloadArtefact(
        msg.content.toString(),
      );
      task.type = 'ACK';
      const taskAlreadyProcessed = await this.isTaskAlreadyStarted(
        task.taskProcessingId,
      );
      if (taskAlreadyProcessed) {
        this.logger.debug(`Skip processing task ${task.taskProcessingId}`);
        await clientSession.commitTransaction();
        ack();
        return;
      }

      await this.sendReplyMessage(task);
      await this.startTaskProcessing(task.taskProcessingId);

      const taskProcessed = await this.processTask(task);

      await this.delay(500);

      if (taskProcessed) {
        await this.completeTaskProcessing(task, taskProcessed);
      }

      await clientSession.commitTransaction();
      ack();
    } catch (error) {
      this.logger.error(`Error processing task: ${error}`);
      if (clientSession) {
        try {
          await clientSession.abortTransaction();
        } catch (abortError) {
          this.logger.error(`Error aborting transaction: ${abortError}`);
        }
      }
      // Don't call ack() here, let the RabbitMQ server handle message redelivery
    } finally {
      if (clientSession) {
        await clientSession.endSession();
      }
    }
  }

  private async isTaskAlreadyStarted(
    taskProcessingId: string,
    clientSession?: any,
  ): Promise<boolean> {
    return this.taskProcessingRepo.checkIfTaskHasStartedAtDate(
      taskProcessingId,
      clientSession,
    );
  }

  private async sendReplyMessage(task: TaskProcessingMessage) {
    this.logger.debug(`Sending reply to queue ${task.replyToQueueName}`);
    await this.rabbitMQService.sendMessage(
      task.replyToQueueName,
      JSON.stringify(task),
    );
  }

  private async startTaskProcessing(
    taskProcessingId: string,
    clientSession?: any,
  ) {
    await this.taskProcessingRepo.updateTaskProcessingWithStartedAtDateTime(
      taskProcessingId,
      clientSession,
    );
    this.logger.debug(`Task processing started for ${taskProcessingId}`);
  }

  private async processTask(task: TaskProcessingMessage) {
    this.logger.debug(`Processing task: ${JSON.stringify(task)}`);
    const artefact = await this.userRepo.getArtefactFromInfostash(
      task.infostashId,
      task.artefactId,
    );
    this.logger.debug(`Found artefact: ${JSON.stringify(artefact)}`);

    const createDirectoryDownloadFile =
      await this.appService.createPdfDirectoryAndDownload(
        task.artefactId,
        task.infostashId,
        randomUUID(),
        artefact.contentLocation,
      );

    await this.userRepo.updateMediaArtifactWithNewTempDirectoryLocations(
      task.infostashId,
      task.artefactId,
      createDirectoryDownloadFile.artefactDownloadLocation,
      createDirectoryDownloadFile.artefactNewFilename,
    );

    return createDirectoryDownloadFile;
  }

  private async completeTaskProcessing(
    task: TaskProcessingMessage,
    taskProcessed: CreateDirectoryDownloadArtefactTaskProcessedMessageType,
    clientSession?: ClientSession,
  ) {
    const completedTask =
      await this.taskProcessingRepo.updateTaskProcessingWithCompletedAtDateTime(
        task.taskProcessingId,
        clientSession,
      );

    await this.taskProcessingRepo.updateTaskProcessingWithNewFileDetails(
      task.taskProcessingId,
      taskProcessed.artefactNewFilename,
      taskProcessed.artefactDownloadLocation,
      clientSession,
    );

    this.logger.debug(`Task Completed: ${completedTask.completedAt}`);

    await this.workflowProcessingLogRepo.addTaskProcessingToWorkflowProcessingLogHistory(
      completedTask,
      clientSession,
    );

    await this.sendTaskCompletionMessage(task);
    return true;
  }

  private async sendTaskCompletionMessage(task: TaskProcessingMessage) {
    task.type = 'TASK';
    await this.rabbitMQService.sendMessage(
      task.replyToQueueName,
      JSON.stringify(task),
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
