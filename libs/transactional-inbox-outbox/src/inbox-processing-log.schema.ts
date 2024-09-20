import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InboxProcessingLogDocument = HydratedDocument<InboxProcessingLog>;

@Schema({
  timestamps: true,
})
export class InboxProcessingLog {
  @Prop()
  infostashId: Types.ObjectId;

  @Prop()
  artefactId: Types.ObjectId;

  @Prop()
  artefactType?: string;

  @Prop()
  uploadLocation: string;

  @Prop()
  folderLocation: string;

  @Prop()
  newFilename: string;

  @Prop()
  downloadedISODateTime?: string;

  @Prop()
  processingStage: string[];
}

export const InboxProcessingLogSchema =
  SchemaFactory.createForClass(InboxProcessingLog);

export class ArtefactType {
  public static readonly;
}
