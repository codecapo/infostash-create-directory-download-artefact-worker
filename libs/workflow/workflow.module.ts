import { Module } from '@nestjs/common';
import { WorkflowService } from './service/workflow.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schema/task.schema';
import {
  TaskProcessing,
  TaskProcessingSchema,
} from './schema/task-processing.schema';
import {
  TaskProcessingError,
  TaskProcessingErrorSchema,
} from './schema/task-processing-error.schema';
import { Workflow, WorkflowSchema } from './schema/workflow.schema';
import {
  WorkflowProcessingLog,
  WorkflowProcessingLogSchema,
} from './schema/workflow-processing-log.schema';
import { MongodbModule } from '@app/mongodb';
import { WorkflowProcessingLogRepo } from './repo/workflow-processing-log.repo';
import { WorkflowRepo } from './repo/workflow.repo';
import { WorkflowMapper } from './mapper/workflow-mapper.service';
import { TaskRepo } from './repo/task.repo';
import { TaskProcessingRepo } from './repo/task-processing.repo';
import { TaskMapper } from './mapper/task-mapper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskProcessing.name, schema: TaskProcessingSchema },
      { name: TaskProcessingError.name, schema: TaskProcessingErrorSchema },
      { name: Workflow.name, schema: WorkflowSchema },
      { name: WorkflowProcessingLog.name, schema: WorkflowProcessingLogSchema },
    ]),
    MongodbModule,
  ],
  providers: [
    WorkflowService,
    WorkflowProcessingLogRepo,
    WorkflowRepo,
    WorkflowMapper,
    TaskRepo,
    TaskProcessingRepo,
    TaskMapper,
  ],
  exports: [WorkflowService, TaskProcessingRepo, WorkflowProcessingLogRepo],
})
export class WorkflowModule {}
