import { Injectable } from '@nestjs/common';
import { createdAt, updatedAt } from '@app/domain/domain.fieldname.constants';
import { Types } from 'mongoose';
import {
  CreateWorkflowRequest,
  CreateWorkflowTaskRequest,
  CreateWorkflowTaskResponse,
  WorkflowResponse,
  WorkflowTask,
} from '../dto/workflow.dto';
import {
  Workflow,
  WorkflowDataViewModel,
  WorkflowDocument,
} from '../schema/workflow.schema';
import { Task, TaskDataViewModel, TaskDocument } from '../schema/task.schema';

@Injectable()
export class WorkflowMapper {
  public mapCreateWorkflowRequestToWorkflowSchema(
    request: CreateWorkflowRequest,
  ): Workflow {
    const mapRequestToSchema: Workflow = {
      name: request.name,
      description: request.description,
    };

    return mapRequestToSchema;
  }

  public mapWorkflowDataViewModelToWorkflowResponse(
    dataViewModel: WorkflowDataViewModel,
  ): WorkflowResponse {
    const workflowTask: WorkflowTask[] = dataViewModel.taskConfiguration.map(
      (item) => {
        const mappedWorkflowTask: WorkflowTask = {
          taskId: item.taskId.toHexString(),
          name: item.name,
        };
        return mappedWorkflowTask;
      },
    );

    const response: WorkflowResponse = {
      workflowId: dataViewModel.workflowId.toHexString(),
      createdAt: dataViewModel.createdAt,
      updatedAt: dataViewModel.updatedAt,
      name: dataViewModel.name,
      description: dataViewModel.description,
      tasks: workflowTask,
    };

    return response;
  }

  public mapWorkflowSchemaToWorkflowDataViewModel(
    schema: WorkflowDocument,
  ): WorkflowDataViewModel {
    // const taskConfigList: TaskDataViewModel[] = schema.taskConfiguration.map(
    //   (item) => {
    //     const taskDataViewModel: TaskDataViewModel = {
    //       taskId: item._id as Types.ObjectId,
    //       createdAt: item.get(createdAt),
    //       updatedAt: item.get(updatedAt),
    //       name: item.name,
    //       description: item.description,
    //       workerQueueName: item.workerQueueName,
    //     };
    //
    //     return taskDataViewModel;
    //   },
    // );

    return {
      workflowId: schema._id,
      createdAt: schema.get(createdAt),
      updatedAt: schema.get(updatedAt),
      name: schema.name,
      description: schema.description,
      taskConfiguration: schema.taskConfiguration,
    };
  }

  public mapCreateWorkflowTaskRequestToTaskSchema(
    createWorkflowTaskRequest: CreateWorkflowTaskRequest,
  ) {
    const task: Partial<Task> = {
      name: createWorkflowTaskRequest.name,
      description: createWorkflowTaskRequest.description,
      taskQueueName: createWorkflowTaskRequest.workerQueueName,
    };

    return task;
  }

  public mapTaskSchemaToWorkflowTaskDataViewModel(task: TaskDocument) {
    const taskDataViewModel: TaskDataViewModel = {
      taskId: task._id as Types.ObjectId,
      createdAt: task.get(createdAt),
      updatedAt: task.get(updatedAt),
      name: task.name,
      description: task.description,
      taskQueueName: task.taskQueueName,
      replyQueueName: task.replyQueueName,
    };

    return taskDataViewModel;
  }

  public mapWorkflowTaskDataViewModelToCreateWorkflowTaskResponse(
    task: TaskDataViewModel,
  ) {
    const createWorkflowTaskResponse: CreateWorkflowTaskResponse = {
      taskId: task.taskId.toHexString(),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      name: task.name,
      description: task.description,
      taskQueueName: task.taskQueueName,
      replyQueueName: task.replyQueueName,
    };

    return createWorkflowTaskResponse;
  }

  // workflow task data view model to create workflow task response
}
