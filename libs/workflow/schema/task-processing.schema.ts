import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TaskDataViewModel } from './task.schema'; // Make sure this import path is correct

export type TaskProcessingDocument = HydratedDocument<TaskProcessing>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class TaskProcessing {
  taskProcessingId?: Types.ObjectId;

  @Prop()
  taskId?: Types.ObjectId;

  @Prop()
  taskName: string;

  @Prop()
  workflowProcessingLogId?: Types.ObjectId;

  @Prop()
  infostashId: Types.ObjectId;

  @Prop()
  artefactId: Types.ObjectId;

  @Prop()
  taskMutationType?: string;

  @Prop()
  startedAt?: string;

  @Prop()
  completedAt?: string;

  @Prop()
  failedAt?: string;

  @Prop()
  taskQueueName: string;

  @Prop()
  replyQueueName: string;

  @Prop()
  stageName: string;

  @Prop({ type: Object })
  payload?: any; // this will be typed payload and form the contract between the producer and consumer
}

export const TaskProcessingSchema =
  SchemaFactory.createForClass(TaskProcessing);

export class TaskProcessingDataViewModel extends TaskDataViewModel {
  infostashId: Types.ObjectId;
  artefactId: Types.ObjectId;
  taskMutationType: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  stageName: string;
  payload: string;
}
