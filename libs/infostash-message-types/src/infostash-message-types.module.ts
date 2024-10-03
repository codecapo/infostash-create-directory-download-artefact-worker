import { Module } from '@nestjs/common';
import { CreateDirectoryDownloadArtefactTaskProcessedMessageType } from '@app/infostash-message-types/create-directory-download-artefact.task.processed.message-type';

@Module({
  exports: [CreateDirectoryDownloadArtefactTaskProcessedMessageType],
})
export class InfostashMessageTypesModule {}
