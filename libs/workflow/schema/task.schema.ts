import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({
  timestamps: true,
})
export class Task extends Document {
  @Prop({ index: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  stageName: string;

  @Prop()
  taskQueueName: string;

  @Prop()
  replyQueueName: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

export class TaskDataViewModel {
  taskId: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  name: string;
  description?: string;
  taskQueueName: string;
  replyQueueName: string;
}
