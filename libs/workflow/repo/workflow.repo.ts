import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import {
  Workflow,
  WorkflowDataViewModel,
  WorkflowDocument,
} from '../schema/workflow.schema';
import { WorkflowMapper } from '../mapper/workflow-mapper.service';
import { TaskDataViewModel } from '../schema/task.schema';

@Injectable()
export class WorkflowRepo {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<Workflow>,
    private readonly workflowMapperService: WorkflowMapper,
  ) {}

  public async createWorkflow(
    workflow: Workflow,
  ): Promise<WorkflowDataViewModel> {
    try {
      const workflowDocument: WorkflowDocument =
        await this.workflowModel.create(workflow);
      return this.workflowMapperService.mapWorkflowSchemaToWorkflowDataViewModel(
        workflowDocument,
      );
    } catch (error) {
      throw new Error(`Could not create workflow: ${error}`);
    }
  }

  public async addTaskToWorkflow(
    workflowId: Types.ObjectId,
    task: TaskDataViewModel,
  ) {
    const workflow = await this.workflowModel.findOneAndUpdate(
      { _id: workflowId },
      {
        $push: { taskConfiguration: task },
        $inc: { __v: 1 },
      },
      { new: true },
    );

    const savedWorkflow = await workflow.save();

    const mappedWorkflow =
      this.workflowMapperService.mapWorkflowSchemaToWorkflowDataViewModel(
        savedWorkflow,
      );

    return mappedWorkflow;
  }

  public async findWorkflowById(
    id: string,
    clientSession?: ClientSession,
  ): Promise<WorkflowDataViewModel> {
    const oid = new Types.ObjectId(id);
    if (!clientSession) {
      const workflow = await this.workflowModel
        .findById(oid)
        .session(clientSession);
      return this.workflowMapperService.mapWorkflowSchemaToWorkflowDataViewModel(
        workflow,
      );
    } else {
      const workflow = await this.workflowModel.findById(oid);
      return this.workflowMapperService.mapWorkflowSchemaToWorkflowDataViewModel(
        workflow,
      );
    }
  }
}
