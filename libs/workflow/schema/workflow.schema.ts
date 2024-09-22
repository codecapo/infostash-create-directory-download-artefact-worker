import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TaskDataViewModel } from './task.schema';

export type WorkflowDocument = HydratedDocument<Workflow>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class Workflow {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  taskConfiguration?: TaskDataViewModel[];
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);

export class WorkflowDataViewModel {
  workflowId: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  taskConfiguration: TaskDataViewModel[];
}
