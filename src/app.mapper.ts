import { Injectable } from '@nestjs/common';
import { TaskProcessingMessage } from '@app/infostash-message-types/workflow.messaging';

@Injectable()
export class AppMapper {
  public mapMessageToCreateDirectoryDownloadArtefact(
    queueMsg: string,
  ): TaskProcessingMessage {
    return JSON.parse(queueMsg);
  }
}
