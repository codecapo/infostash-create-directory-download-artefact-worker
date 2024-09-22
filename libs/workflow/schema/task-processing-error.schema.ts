import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocumentFromSchema } from 'mongoose';
import {
  TaskProcessing,
  TaskProcessingDataViewModel,
  TaskProcessingSchema,
} from './task-processing.schema';

export type TaskProcessingErrorDocument = HydratedDocumentFromSchema<
  typeof TaskProcessingSchema
>;

@Schema({ timestamps: true, optimisticConcurrency: true })
export class TaskProcessingError extends TaskProcessing {}

export const TaskProcessingErrorSchema =
  SchemaFactory.createForClass(TaskProcessingError);

export class TaskProcessingErrorDataViewModel extends TaskProcessingDataViewModel {}
