export class TaskProcessingMessageHeader {
  correlationId: string;
  workflowProcessingLogId: string;
  infostashId: string;
  artefactId: string;
  taskProcessingId: string;
  taskQueueName: string;
  replyToQueueName: string;
  processingStageName: string;
}

export class TaskProcessingMessage<T> {
  messageHeader: TaskProcessingMessageHeader;
  messageBody: T;
}
