import { HttpException } from '@nestjs/common';

export class CouldNotCreateWorkflowTask extends HttpException {
  constructor(vars: any) {
    const errorCode = 'TASK001';
    const errorMessage = `Could not create workflow task with request data ${vars.data}`;
    const statusCode = 400;
    super(
      {
        errorCode,
        errorMessage,
        statusCode,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
