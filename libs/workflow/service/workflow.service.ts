import { Injectable, Logger } from '@nestjs/common';
import { WorkflowProcessingLogRepo } from "../repo/workflow-processing-log.repo";
import { WorkflowRepo } from "../repo/workflow.repo";
import { WorkflowMapper } from "../mapper/workflow-mapper.service";
import { TaskRepo } from "../repo/task.repo";
import { MongodbService } from "@app/mongodb";
import { TaskProcessingRepo } from "../repo/task-processing.repo";
import { TaskMapper } from "../mapper/task-mapper.service";
import { TaskProcessing } from "../schema/task-processing.schema";
import {
  WorkflowProcessingLogDocument,
  WorkflowTaskProcessingLogWithRelatedTasks
} from "../schema/workflow-processing-log.schema";
import {
  AddTaskToWorkflowTaskRequest, AddTaskToWorkflowTaskResponse, CreateTaskProcessingRequest,
  CreateWorkflowRequest,
  CreateWorkflowTaskRequest, InitialiseWorkflowTaskProcessingRequest,
  WorkflowResponse
} from "../dto/workflow.dto";
import { ClientSession, Types } from "mongoose";
import { UnprocessedTaskProcessing } from "../schema/task-processing-stage.payloads";


@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly workflowProcessingLogRepo: WorkflowProcessingLogRepo,
    private readonly workflowRepo: WorkflowRepo,
    private readonly workflowMapper: WorkflowMapper,
    private readonly taskRepo: TaskRepo,
    private readonly mongodbService: MongodbService,
    private readonly taskProcessingRepo: TaskProcessingRepo,
    private readonly taskMapper: TaskMapper,
  ) {}

  public async findTaskToWorkOn(): Promise<TaskProcessing[]> {
    try {
      const relatedWorkflowTasks: WorkflowTaskProcessingLogWithRelatedTasks[] =
        await this.workflowProcessingLogRepo.findWorkflowWithRelatedTasksToProcess();

      const workflowTaskConfigurations = await Promise.all(
        relatedWorkflowTasks.map(async (task) => {
          const workflowTask = await this.workflowRepo.findWorkflowById(
            task.workflowId,
          );
          return {
            workflowId: task.workflowId,
            taskConfiguration: workflowTask.taskConfiguration,
          };
        }),
      );

      // Flatten all related tasks and processed tasks
      const allRelatedTasks: TaskProcessing[] = relatedWorkflowTasks.flatMap(
        (task) => {
          return this.taskMapper.enrichRelatedTaskProcessing(task);
        },
      );
      const allProcessedTasks: TaskProcessing[] = relatedWorkflowTasks.flatMap(
        (task) => {
          return this.taskMapper.enrichTaskProcessingHistoryTaskProcessing(
            task,
          );
        },
      );

      // Create sets for efficient lookup
      const processedTaskIds = new Set(
        allProcessedTasks.map((task) => task.taskId.toHexString()),
      );
      const workflowConfiguredTaskIds = new Set(
        workflowTaskConfigurations.flatMap((wt) =>
          wt.taskConfiguration.map((task) => task.taskId.toHexString()),
        ),
      );

      // Filter related tasks that are in the workflow configuration and haven't been processed
      const tasksToWorkOn = allRelatedTasks.filter((task) => {
        return (
          task.taskId.toHexString() &&
          workflowConfiguredTaskIds.has(task.taskId.toHexString()) &&
          !processedTaskIds.has(task.taskId.toHexString())
        );
      });
      return tasksToWorkOn;
    } catch (error) {
      this.logger.error(`Error finding task to work on: ${error.message}`);
      throw error; // Re-throw the error after logging
    }
  }

  public async createWorkflow(
    createWorkflowRequest: CreateWorkflowRequest,
  ): Promise<WorkflowResponse> {
    try {
      const workflow =
        this.workflowMapper.mapCreateWorkflowRequestToWorkflowSchema(
          createWorkflowRequest,
        );
      const savedWorkflow = await this.workflowRepo.createWorkflow(workflow);
      return this.workflowMapper.mapWorkflowDataViewModelToWorkflowResponse(
        savedWorkflow,
      );
    } catch (error) {
      this.logger.error(`Could not create workflow: ${error.message}`);
      throw error;
    }
  }

  public async createWorkflowTask(
    createWorkflowTaskRequest: CreateWorkflowTaskRequest,
  ) {
    try {
      const task = this.workflowMapper.mapCreateWorkflowTaskRequestToTaskSchema(
        createWorkflowTaskRequest,
      );
      const savedTask = await this.taskRepo.createTask(task);
      return this.workflowMapper.mapWorkflowTaskDataViewModelToCreateWorkflowTaskResponse(
        savedTask,
      );
    } catch (error) {
      this.logger.error(`Error creating workflow task: ${error.message}`);
      throw error;
    }
  }

  public async addWorkflowToTask(
    addTaskToWorkflow: AddTaskToWorkflowTaskRequest,
  ): Promise<AddTaskToWorkflowTaskResponse> {
    try {
      const task = await this.taskRepo.findTaskById(addTaskToWorkflow.taskId);
      if (!task) {
        throw new Error(`Task with ID ${addTaskToWorkflow.taskId} not found`);
      }

      const workflowOid = new Types.ObjectId(addTaskToWorkflow.workflowId);
      const workflowDataViewModel = await this.workflowRepo.addTaskToWorkflow(
        workflowOid,
        task,
      );
      return this.workflowMapper.mapWorkflowDataViewModelToWorkflowResponse(
        workflowDataViewModel,
      );
    } catch (error) {
      this.logger.error(`Error adding workflow to task: ${error.message}`);
      throw error;
    }
  }

  public async initialiseWorkflow(
    request: InitialiseWorkflowTaskProcessingRequest,
  ) {
    return this.mongodbService.executeTransaction(async (clientSession) => {
      try {
        const workflow = await this.workflowRepo.findWorkflowById(
          request.workflowId,
          clientSession,
        );

        if (!workflow) {
          throw new Error(`Workflow with ID ${request.workflowId} not found`);
        }

        const workflowProcessingLog: Partial<WorkflowProcessingLogDocument> = {
          taskProcessingHistory: [],
          workflowId: workflow.workflowId.toHexString(),
          workflowName: workflow.name,
        };

        const taskProcessingPayload: UnprocessedTaskProcessing = {
          name: 'UnprocessedTask',
          description: 'initialise workflow with unprocessed task',
          stageName: 'UNPROCESSED',
        };

        const task = await this.taskRepo.findTaskByName(
          taskProcessingPayload.name,
          clientSession,
        );
        if (!task) {
          throw new Error(
            `Task with name ${taskProcessingPayload.name} not found`,
          );
        }

        const createdWorkflowProcessingLog =
          await this.workflowProcessingLogRepo.createWorkflowProcessingLog(
            workflowProcessingLog,
            clientSession,
          );

        const createTaskProcessing: TaskProcessing = {
          completedAt: '',
          failedAt: '',
          taskProcessingId: undefined,
          replyQueueName: '',
          stageName: '',
          startedAt: '',
          taskQueueName: '',
          workflowProcessingLogId: createdWorkflowProcessingLog._id,
          infostashId: new Types.ObjectId(request.infostashId),
          artefactId: new Types.ObjectId(request.infostashId),
          taskId: task.taskId,
          taskName: task.name,
          payload: taskProcessingPayload,
          taskMutationType: 'NEW',
        };

        const savedTaskProcessing =
          await this.taskProcessingRepo.createTaskProcessing(
            createTaskProcessing,
            clientSession,
          );

        if (savedTaskProcessing) {
          return this.workflowProcessingLogRepo.addTaskProcessingToWorkflowProcessingLogHistory(
            savedTaskProcessing,
            clientSession,
          );
        }
      } catch (error) {
        this.logger.error(`Error initialising workflow: ${error.message}`);
        throw error;
      }
    });
  }

  public async createTaskProcessing(
    createTaskProcessingRequest: CreateTaskProcessingRequest,
    session?: ClientSession,
  ) {
    try {
      const task = await this.taskRepo.findTaskByName(
        createTaskProcessingRequest.taskName,
      );
      if (!task) {
        throw new Error(
          `Task with name ${createTaskProcessingRequest.taskName} not found`,
        );
      }

      const taskProcessing: TaskProcessing = {
        infostashId: new Types.ObjectId(
          createTaskProcessingRequest.infostashId,
        ),
        artefactId: new Types.ObjectId(createTaskProcessingRequest.artefactId),
        taskId: task.taskId,
        taskName: task.name,
        taskQueueName: createTaskProcessingRequest.taskQueueName,
        replyQueueName: createTaskProcessingRequest.replyQueueName,
        stageName: createTaskProcessingRequest.stageName,
        taskMutationType: createTaskProcessingRequest.taskMutationType,
        payload: createTaskProcessingRequest.payload,
      };

      return this.taskProcessingRepo.createTaskProcessing(
        taskProcessing,
        session,
      );
    } catch (error) {
      this.logger.error(`Error creating task processing: ${error.message}`);
      throw error;
    }
  }
}
