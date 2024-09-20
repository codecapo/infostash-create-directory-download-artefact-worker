import { Injectable } from '@nestjs/common';
import { CreateDirectoryDownloadArtefactTaskMessageType } from '@app/infostash-message-types/create-directory-download-artefact.task.message-type';
import { TaskProcessingMessage } from '@app/infostash-message-types/workflow.messaging';

@Injectable()
export class AppMapper {
  public mapMessageToCreateDirectoryDownloadArtefact(
    queueMsg: string,
  ): TaskProcessingMessage<CreateDirectoryDownloadArtefactTaskMessageType> {
    const parseMsg: TaskProcessingMessage<CreateDirectoryDownloadArtefactTaskMessageType> =
      JSON.parse(queueMsg);

    // if (parseMsg.processingLogRequestId == null)
    //   throw Error(
    //     `processingLogRequestId is null, please provide filename in payload`,
    //   );
    // if (parseMsg.infostashId == null)
    //   throw Error(`infostashId is null, please provide filename in payload`);
    // if (parseMsg.mediaArtefactId == null)
    //   throw Error(
    //     `mediaArtefactId is null, please provide filename in payload`,
    //   );
    // if (parseMsg.newfileName == null)
    //   throw Error(`newfileName is null, please provide filename in payload`);
    // if (parseMsg.uploadLocation == null)
    //   throw Error(`uploadLocation is null, please provide filename in payload`);
    // if (parseMsg.folderLocation == null)
    //   throw Error(`folderLocation is null, please provide filename in payload`);
    // if (parseMsg.processingStage == null)
    //   throw Error(
    //     `processingStage is null, please provide filename in payload`,
    //   );

    return parseMsg;
  }
}
