import { HttpException } from '@nestjs/common';

export class CouldNotCreateWorkflow extends HttpException {
  constructor(vars: any) {
    const errorCode = 'WORK001';
    const errorMessage = `Could not create workflow with request data ${vars.data}`;
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
