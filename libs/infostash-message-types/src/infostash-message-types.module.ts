import { Module } from '@nestjs/common';
import { CreateDirectoryDownloadArtefactTaskMessageType } from '@app/infostash-message-types/create-directory-download-artefact.task.message-type';

@Module({
  exports: [CreateDirectoryDownloadArtefactTaskMessageType],
})
export class InfostashMessageTypesModule {}
