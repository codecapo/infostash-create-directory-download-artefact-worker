import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '@app/rabbit-mq';
import { AppMapper } from './app.mapper';
import { AppService } from './app.service';
import { TaskProcessingMessage } from '@app/infostash-message-types/workflow.messaging';
import { CreateDirectoryDownloadArtefactTaskMessageType } from '@app/infostash-message-types/create-directory-download-artefact.task.message-type';
import { TaskProcessingRepo } from '../libs/workflow/repo/task-processing.repo';
import { UserRepo } from '@app/domain/user/repo/user.repo';
import * as crypto from 'node:crypto';

@Injectable()
export class AppWorker implements OnModuleInit {
  private logger = new Logger(AppWorker.name);

  private taskQueueName: string =
    process.env.QN_CREATE_DIRECTORY_DOWNLOAD_ARTEFACT_TASK;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly appService: AppService,
    private readonly appMapper: AppMapper,
    private readonly taskProcessingRepo: TaskProcessingRepo,
    private readonly userRepo: UserRepo,
  ) {}

  async onModuleInit() {
    // will start consuming on application startup
    await this.setupMessageConsumer();
  }

  async setupMessageConsumer() {
    try {
      await this.rabbitMQService.consumeMessages(
        this.taskQueueName,
        async (msg, ack) => {
          if (msg !== null) {
            const task = this.appMapper.mapMessageToCreateDirectoryDownloadArtefact(
              msg.content.toString(),
            );

            const isStartedAtPresent = await this.taskProcessingRepo.checkIfTaskHasStartedAtDate(
              task.messageHeader.taskProcessingId,
            );

            if (isStartedAtPresent) {
              this.logger.debug(`skip processing task ${task.messageHeader.taskProcessingId}`);
              ack(); // Acknowledge the message even if we're skipping it
              return;
            }

            this.logger.debug(`sending reply to queue ${task.messageHeader.replyToQueueName}`);

            const replyMessage: TaskProcessingMessage<string> = {
              messageHeader: task.messageHeader,
              messageBody: 'Received Task Processing Message',
            };

            await this.rabbitMQService.sendMessage(
              replyMessage.messageHeader.replyToQueueName,
              JSON.stringify(replyMessage),
            );

            await this.taskProcessingRepo.updateTaskProcessingWithStartedAtDateTime(task.messageHeader.taskProcessingId)

            this.logger.debug(
              `Task processing started for ${task.messageHeader.taskProcessingId} infostash ${task.messageHeader.infostashId} media artefact ${task.messageHeader.artefactId}`,
            );

            try {
              const taskProcessed = await this.processTask(task);

              if (taskProcessed) {
                await this.rabbitMQService.sendMessage(
                  replyMessage.messageHeader.replyToQueueName,
                  JSON.stringify(replyMessage),
                );
              }

              await this.delay(1000)

              ack()

            } catch (error) {
              this.logger.error(`Error processing task: ${error}`);
              // Here you might want to implement some retry logic or dead-letter queue
              // For now, we'll just acknowledge the message to remove it from the queue
              ack();
            }
          }
        },
      );
      this.logger.debug(`Started consuming messages from queue: ${this.taskQueueName}`);
    } catch (e) {
      this.logger.error(`Problem with consuming message: ${e}`);
    }
  }

  private async processTask(
    task: TaskProcessingMessage<CreateDirectoryDownloadArtefactTaskMessageType>,
  ) {
    this.logger.debug(`Processing task: ${JSON.stringify(task)}`);

    const artefact = await this.userRepo.getArtefactFromInfostash(
      task.messageHeader.infostashId,
      task.messageHeader.artefactId,
    );

    this.logger.debug(`find artefact ${JSON.stringify(artefact)}`);

    const createDirDownloadArtefact =
     await this.appService.createPdfDirectoryAndDownload(
        task.messageHeader.artefactId,
        task.messageHeader.infostashId,
        crypto.randomUUID(),
        artefact.contentLocation,
      );

    if (createDirDownloadArtefact) {
      this.logger.debug(
        `finished processing artefact ${JSON.stringify(createDirDownloadArtefact)}`,
      );

      return createDirDownloadArtefact;
    }
  }
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
