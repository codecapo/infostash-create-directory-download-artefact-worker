import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { WorkflowMapper } from '../mapper/workflow-mapper.service';
import { Task, TaskDataViewModel } from '../schema/task.schema';

@Injectable()
export class TaskRepo {
  private readonly logger = new Logger(TaskRepo.name);

  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly workflowMapper: WorkflowMapper,
  ) {}

  public async createTask(task: Partial<Task>): Promise<TaskDataViewModel> {
    try {
      const createdTask = await this.taskModel.create(task);
      return this.workflowMapper.mapTaskSchemaToWorkflowTaskDataViewModel(
        createdTask,
      );
    } catch (error) {
      this.logger.error(`Could not create task in MongoDB: ${error.message}`);
      throw error;
    }
  }

  public async findTaskById(id: string): Promise<TaskDataViewModel | null> {
    try {
      const oid = new Types.ObjectId(id);
      const task = await this.taskModel.findById(oid);
      if (!task) {
        this.logger.warn(`Task with id ${id} not found`);
        return null;
      }
      return this.workflowMapper.mapTaskSchemaToWorkflowTaskDataViewModel(task);
    } catch (error) {
      this.logger.error(`Error finding task by id: ${error.message}`);
      throw error;
    }
  }

  public async findTaskByName(
    name: string,
    session?: ClientSession,
  ): Promise<TaskDataViewModel | null> {
    try {
      this.logger.debug(`Finding task by name: ${name}`);
      const query = this.taskModel.findOne({ name });

      const task = session
        ? await query.session(session).exec()
        : await query.exec();

      if (!task) {
        this.logger.warn(`Task with name ${name} not found`);
        return null;
      }

      this.logger.debug(`Found task with id: ${task._id}`);
      return this.workflowMapper.mapTaskSchemaToWorkflowTaskDataViewModel(task);
    } catch (error) {
      this.logger.error(`Error finding task by name: ${error.message}`);
      throw error;
    }
  }
}
