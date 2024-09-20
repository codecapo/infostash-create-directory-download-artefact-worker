import { HttpException } from '@nestjs/common';

export class CouldNotFindUserByIdError extends HttpException {
  constructor(vars: any) {
    const errorCode = 'USER003';
    const errorMessage = `Could not find user with ${vars.var1}, please provide valid id`;
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
