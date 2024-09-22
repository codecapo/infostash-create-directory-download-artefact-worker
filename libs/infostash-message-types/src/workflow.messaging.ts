export class TaskProcessingMessage {
  correlationId: string;
  workflowProcessingLogId: string;
  infostashId: string;
  artefactId: string;
  taskProcessingId: string;
  taskQueueName: string;
  replyToQueueName: string;
  processingStageName: string;
}