import { Types } from 'mongoose';
import { createdAt, updatedAt } from '@app/domain/domain.fieldname.constants';
import {
  TaskProcessing,
  TaskProcessingDataViewModel,
  TaskProcessingDocument,
} from '../schema/task-processing.schema';
import { Injectable } from '@nestjs/common';
import {
  TaskProcessingErrorDataViewModel,
  TaskProcessingErrorDocument,
} from '../schema/task-processing-error.schema';
import { WorkflowTaskProcessingLogWithRelatedTasks } from '../schema/workflow-processing-log.schema';

// this means i dont need the dataviewmodels as we can just use partial to omit the document stuff

@Injectable()
export class TaskMapper {
  public mapSchemaToTaskProcessingDataViewModel(
    schema: TaskProcessingDocument,
  ) {
    if (schema == null)
      throw new Error('Schema was not provided to task mapper');
    if (schema._id) throw new Error('_id was not provided to mapper');
    if (schema.infostashId == null)
      throw new Error('infostashId was not provided to mapper');
    if (schema.artefactId == null)
      throw new Error('artefactId was not provided to mapper');
    if (schema.payload == null)
      throw new Error('payload was not provided to mapper');

    const dataViewModel: TaskProcessingDataViewModel = {
      createdAt: schema.get(createdAt),
      updatedAt: schema.get(updatedAt),
      infostashId: schema.infostashId,
      artefactId: schema.artefactId,
      taskId: schema._id as Types.ObjectId,
      name: schema.taskName,
      taskMutationType: schema.taskMutationType,
      startedAt: schema.startedAt,
      completedAt: schema.completedAt,
      failedAt: schema.failedAt,
      taskQueueName: schema.taskQueueName,
      replyQueueName: schema.replyQueueName,
      stageName: schema.stageName,
      payload: schema.payload,
    };

    return dataViewModel;
  }

  public mapSchemaToTaskProcessingErrorDataViewModel(
    schema: TaskProcessingErrorDocument,
  ) {
    if (schema == null)
      throw new Error('Schema was not provided to task mapper');
    if (schema._id == null)
      throw new Error('_id was not provided to task mapper');
    if (schema.artefactId == null)
      throw new Error('artefactId was not provided to task mapper');
    if (schema.infostashId == null)
      throw new Error('infostashId was not provided to task mapper');
    if (schema.payload == null)
      throw new Error('payload was not provided to task mapper');

    const dvm: TaskProcessingErrorDataViewModel = {
      taskId: schema._id as Types.ObjectId,
      artefactId: schema.artefactId,
      infostashId: schema.infostashId,
      createdAt: schema.get(createdAt),
      updatedAt: schema.get(updatedAt),
      description: schema.payload.description,
      name: schema.payload.name,
      taskQueueName: schema.taskQueueName,
      replyQueueName: schema.replyQueueName,
      payload: schema.payload,
      stageName: schema.stageName,
      taskMutationType: schema.taskMutationType,
    };

    return dvm;
  }

  public enrichRelatedTaskProcessing(
    task: WorkflowTaskProcessingLogWithRelatedTasks,
  ): TaskProcessing[] {
    const doc = task._id;
    return task.relatedTasks.map((item) => {
      const task: TaskProcessing = {
        taskProcessingId: item._id,
        workflowProcessingLogId: doc,
        infostashId: item.infostashId,
        artefactId: item.artefactId,
        taskId: item.taskId,
        taskName: item.taskName,
        startedAt: item.startedAt,
        completedAt: item.completedAt,
        failedAt: item.failedAt,
        taskQueueName: item.taskQueueName,
        replyQueueName: item.replyQueueName,
        stageName: item.stageName,
        taskMutationType: item.taskMutationType,
        payload: item.payload,
      };
      return task;
    });
  }

  public enrichTaskProcessingHistoryTaskProcessing(
    task: WorkflowTaskProcessingLogWithRelatedTasks,
  ): TaskProcessing[] {
    const doc = task._id;
    return task.taskProcessingHistory.map((item) => {
      const task: TaskProcessing = {
        taskProcessingId: item._id,
        workflowProcessingLogId: doc,
        infostashId: item.infostashId,
        artefactId: item.artefactId,
        taskId: item.taskId,
        taskName: item.taskName,
        startedAt: item.startedAt,
        completedAt: item.completedAt,
        failedAt: item.failedAt,
        taskQueueName: item.taskQueueName,
        replyQueueName: item.replyQueueName,
        stageName: item.stageName,
        taskMutationType: item.taskMutationType,
        payload: item.payload,
      };
      return task;
    });
  }
}
