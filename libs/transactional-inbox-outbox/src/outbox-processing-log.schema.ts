import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OutboxProcessingLogDocument = HydratedDocument<OutboxProcessingLog>;

@Schema({
  timestamps: true,
})
export class OutboxProcessingLog {
  @Prop()
  inboxProcessingLogRequestId: Types.ObjectId;
  @Prop()
  infostashId: Types.ObjectId;

  @Prop()
  artefactId: Types.ObjectId;

  @Prop()
  uploadLocation: string;

  @Prop()
  folderLocation: string;

  @Prop()
  newFilename: string;

  @Prop()
  processingStage: string[];
}

export const OutboxProcessingLogSchema =
  SchemaFactory.createForClass(OutboxProcessingLog);
