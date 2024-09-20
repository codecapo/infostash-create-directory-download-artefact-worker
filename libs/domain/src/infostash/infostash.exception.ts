import { HttpException } from '@nestjs/common';
import domainExceptionLog from '../../domain.exception.log.';

export class CouldNotGetSentencesFromAnthropic extends HttpException {
  constructor(vars: any) {
    const errorCode = domainExceptionLog(vars).didNotReturnSentences.errorCode;
    const errorMessage =
      domainExceptionLog(vars).didNotReturnSentences.errorMessage;
    const statusCode =
      domainExceptionLog(vars).didNotReturnSentences.statusCode;
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
