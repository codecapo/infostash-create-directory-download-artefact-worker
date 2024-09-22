import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ClientSession, Model } from 'mongoose';
import {
  WorkflowProcessingLog,
  WorkflowProcessingLogDocument,
  WorkflowTaskProcessingLogWithRelatedTasks,
} from '../schema/workflow-processing-log.schema';
import {
  TaskProcessing,
  TaskProcessingDocument,
} from '../schema/task-processing.schema';

@Injectable()
export class WorkflowProcessingLogRepo {
  private readonly logger = new Logger(WorkflowProcessingLog.name);

  constructor(
    @InjectModel(WorkflowProcessingLog.name)
    private workflowProcessingLogModel: Model<WorkflowProcessingLog>,
  ) {}

  public async getWorkflowProcessingLogWithUnprocessedTask(): Promise<
    TaskProcessingDocument[]
  > {
    const aggregationPipeline = [
      // Match documents that have at least one taskProcessingHistory item with UNPROCESSED stage
      {
        $match: {
          'taskProcessingHistory.payload.stageName': 'UNPROCESSED',
        },
      },
      // Filter the taskProcessingHistory array
      {
        $project: {
          workflowId: 1,
          workflowName: 1,
          createdAt: 1,
          updatedAt: 1,
          taskProcessingHistory: {
            $filter: {
              input: '$taskProcessingHistory',
              as: 'task',
              cond: { $eq: ['$$task.payload.stageName', 'UNPROCESSED'] },
            },
          },
        },
      },
      // Limit to one document
      { $limit: 1 },
    ];

    const unprocessed =
      await this.workflowProcessingLogModel.aggregate(aggregationPipeline);

    this.logger.debug(
      `Found unprocessed workflow: ${JSON.stringify(unprocessed)}`,
    );

    return unprocessed;
  }

  public async createWorkflowProcessingLog(
    workflowProcessingLog: Partial<WorkflowProcessingLog>,
    clientSession?: ClientSession,
  ): Promise<WorkflowProcessingLogDocument> {
    const createWorkProcessingLog = new this.workflowProcessingLogModel(
      workflowProcessingLog,
    );
    if (clientSession) {
      return await createWorkProcessingLog.save({ session: clientSession });
    } else {
      return await createWorkProcessingLog.save();
    }
  }

  public async addTaskProcessingToWorkflowProcessingLogHistory(
    taskProcessing: TaskProcessing,
    clientSession?: ClientSession,
  ) {
    const update = {
      $set: { infostashId: taskProcessing.infostashId },
      $push: { taskProcessingHistory: taskProcessing },
      $inc: { __v: 1 },
    };
    const options = {
      new: true,
      runValidators: true,
      session: clientSession, // This allows the operation to be part of a transaction if a session is provided
    };

    const updatedDocument =
      await this.workflowProcessingLogModel.findOneAndUpdate(
        { _id: taskProcessing.workflowProcessingLogId },
        update,
        options,
      );

    if (!updatedDocument) {
      throw new Error(
        `WorkflowProcessingLog with id ${taskProcessing.workflowProcessingLogId} not found`,
      );
    }

    return updatedDocument;
  }

  public async findWorkflowWithRelatedTasksToProcess() {
    const aggregationPipeline = [
      // Match documents that have at least one taskProcessingHistory item with UNPROCESSED stage
      {
        $match: {
          'taskProcessingHistory.payload.stageName': 'UNPROCESSED',
        },
      },
      // Project the required fields
      {
        $project: {
          workflowId: 1,
          workflowName: 1,
          createdAt: 1,
          updatedAt: 1,
          infostashId: 1, // Using the actual infostashId field
          taskProcessingHistory: {
            $filter: {
              input: '$taskProcessingHistory',
              as: 'task',
              cond: { $eq: ['$$task.payload.stageName', 'UNPROCESSED'] },
            },
          },
        },
      },
      // Lookup related tasks
      {
        $lookup: {
          from: 'taskprocessings', // Collection name is typically plural
          let: { infostashId: '$infostashId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$infostashId', '$$infostashId'] },
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: [{ $type: '$startedAt' }, 'missing'] },
                            { $eq: [{ $type: '$completedAt' }, 'missing'] },
                            { $eq: [{ $type: '$failedAt' }, 'missing'] },
                          ],
                        },
                        {
                          $and: [
                            { $eq: ['$startedAt', null] },
                            { $eq: ['$completedAt', null] },
                            { $eq: ['$failedAt', null] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'relatedTasks',
        },
      },
      // Limit to one document
    ];

    const workflowProcessingWithRelatedTasksToProcess: WorkflowTaskProcessingLogWithRelatedTasks[] =
      await this.workflowProcessingLogModel.aggregate(aggregationPipeline);

    return workflowProcessingWithRelatedTasksToProcess;
  }
}
