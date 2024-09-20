import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class DomainUtilsService {
  constructor() {}

  public convertToObjectId(id: string): Types.ObjectId {
    if (Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    } else {
      throw new Error('Invalid ObjectId string');
    }
  }
}
