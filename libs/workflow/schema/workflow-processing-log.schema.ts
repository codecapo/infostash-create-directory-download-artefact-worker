import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  TaskProcessing,
  TaskProcessingDocument,
} from './task-processing.schema';
import { Task } from './task.schema';

export type WorkflowProcessingLogDocument =
  HydratedDocument<WorkflowProcessingLog>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class WorkflowProcessingLog {
  @Prop()
  workflowId: string;

  @Prop()
  workflowName: string;

  @Prop()
  infostashId: Types.ObjectId;

  @Prop()
  taskProcessingHistory: TaskProcessing[];

  @Prop()
  requiredTasks: Task[];
}

export const WorkflowProcessingLogSchema = SchemaFactory.createForClass(
  WorkflowProcessingLog,
);

export class WorkflowTaskProcessingLogWithRelatedTasks {
  _id: Types.ObjectId;
  workflowProcessingLogId: string;

  workflowId: string;

  workflowName: string;

  infostashId: Types.ObjectId;

  taskProcessingHistory: TaskProcessingDocument[];

  relatedTasks: TaskProcessingDocument[];
}
