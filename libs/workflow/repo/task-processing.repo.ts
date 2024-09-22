import { InjectModel } from '@nestjs/mongoose';

import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import {
  TaskProcessing,
  TaskProcessingDocument,
} from '../schema/task-processing.schema';

@Injectable()
export class TaskProcessingRepo {
  private logger = new Logger(TaskProcessingRepo.name);

  constructor(
    @InjectModel(TaskProcessing.name)
    private readonly taskProcessingModel: Model<TaskProcessingDocument>,
  ) {}

  public async createTaskProcessing(
    taskProcessing: TaskProcessing,
    clientSession?: ClientSession,
  ): Promise<TaskProcessing> {
    if (clientSession) {
      const createdTaskProcessing = new this.taskProcessingModel(
        taskProcessing,
      );
      const transactionalSave = await createdTaskProcessing.save({
        session: clientSession,
      });

      return transactionalSave;
    } else {
      return await this.taskProcessingModel.create(taskProcessing);
    }
  }

  public async getNotStartedOrCompletedTasks(
    infostashId: string,
    clientSession?: ClientSession,
  ): Promise<TaskProcessingDocument[]> {
    const infostashOid = new Types.ObjectId(infostashId);

    const aggregateQuery = [
      {
        $match: {
          infostashId: infostashOid,
          $or: [
            { startedAt: null, completedAt: null, failedAt: null },
            {
              startedAt: { $exists: false },
              completedAt: { $exists: false },
              failedAt: { $exists: false },
            },
          ],
        },
      },
    ];

    if (clientSession) {
      return this.taskProcessingModel
        .aggregate(aggregateQuery)
        .session(clientSession);
    } else {
      return this.taskProcessingModel.aggregate(aggregateQuery);
    }
  }

  public async updateTaskProcessingWithStartedAtDateTime(
    taskProcessingId: string,
    clientSession?: ClientSession,
  ): Promise<TaskProcessingDocument> {
    try {
      const newTime = new Date().toISOString();

      const oid = new Types.ObjectId(taskProcessingId);
      if (clientSession) {
        return this.taskProcessingModel
          .findByIdAndUpdate(oid, { $set: { startedAt: newTime } })
          .session(clientSession);
      } else {
        return this.taskProcessingModel.findByIdAndUpdate(oid, {
          $set: { startedAt: newTime },
        });
      }
    } catch (e) {
      this.logger.error(
        `Could not update started at time for task: ${taskProcessingId} ${e}`,
      );
      return e;
    }
  }

  public async updateTaskProcessingWithCompletedAtDateTime(
    taskProcessingId: string,
    clientSession?: ClientSession,
  ): Promise<TaskProcessingDocument> {
    try {
      const newTime = new Date().toISOString();
      const options = {
        new: true,
        runValidators: true,
        session: clientSession,
      };
      const oid = new Types.ObjectId(taskProcessingId);
      if (clientSession) {
        return this.taskProcessingModel
          .findByIdAndUpdate(
            oid,
            { $set: { completedAt: newTime }, $inc: { __v: 1 } },
            options,
          )
          .session(clientSession);
      } else {
        return this.taskProcessingModel.findByIdAndUpdate(
          oid,
          {
            $set: { completedAt: newTime },
            $inc: { __v: 1 },
          },
          options,
        );
      }
    } catch (e) {
      this.logger.error(
        `Could not update started at time for task: ${taskProcessingId} ${e}`,
      );
      return e;
    }
  }

  public async checkIfTaskHasStartedAtDate(
    taskProcessingId: string,
    clientSession?: ClientSession,
  ): Promise<boolean> {
    try {
      const oid = new Types.ObjectId(taskProcessingId);
      const taskProcessing = await this.taskProcessingModel.findById(oid);
      if (taskProcessing.startedAt) {
        this.logger.debug(
          `task ${taskProcessing._id.toHexString()} already started`,
        );
        return true;
      }
    } catch (error) {
      console.error('Error checking task start status:', error);
      throw error;
    }
  }
}
