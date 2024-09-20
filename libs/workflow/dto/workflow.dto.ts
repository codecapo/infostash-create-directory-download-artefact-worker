import { IsNotEmpty } from 'class-validator';

export class CreateWorkflowRequest {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;
  tasks?: WorkflowTask[];
}

export class WorkflowResponse {
  createdAt: string;
  updatedAt: string;
  workflowId: string;
  name: string;
  description: string;
  tasks: WorkflowTask[];
}

export class WorkflowTask {
  taskId: string;
  name: string;
}

export class CreateWorkflowTaskRequest {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  workerQueueName: string;
}

export class CreateWorkflowTaskResponse {
  taskId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  taskQueueName?: string;
  replyQueueName?: string;
}

export class AddTaskToWorkflowTaskRequest {
  workflowId: string;
  taskId: string;
}

export class AddTaskToWorkflowTaskResponse {}

export class InitialiseWorkflowTaskProcessingRequest {
  workflowId: string;
  infostashId: string;
  artefactId: string;
}

export class CreateTaskProcessingRequest {
  infostashId: string;
  artefactId: string;
  taskName: string;
  startedAt: string;
  completedAt: string;
  failedAt: string;
  taskQueueName: string;
  replyQueueName: string;
  stageName: string;
  taskMutationType: string;
  payload: any;
}
