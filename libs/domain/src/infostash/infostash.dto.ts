import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateInfostashRequest {
  @IsString({
    message:
      'Please ensure user id is a text which contains alphanumeric characters',
  })
  @IsNotEmpty({ message: 'Please ensure that the user id is not empty' })
  userId: string;

  @IsString({
    message:
      'Please ensure name is a text which contains alphanumeric characters',
  })
  @IsNotEmpty({
    message: 'Please ensure that the info stash name is not empty',
  })
  name: string;

  @IsString({
    message:
      'Please ensure name is a text which contains alphanumeric characters',
  })
  @IsNotEmpty({
    message: 'Please ensure that the info stash summary is not empty',
  })
  summary: string;
}

export class CreateInfostashResponse {
  userId: any;
  infostashId: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  name: string;
  summary: string;
  textEmbeddingName: string;
  imageEmbeddingName: string;
}

export class AddInfostashFromTextArtefactRequest {
  userId: string;
  infostashId: string;
  @IsString({
    message:
      'ensure text contains letters, numbers and punctuational characters',
  })
  data: string;
}

export class AddInfostashFromMediaArtefactRequest {
  userId: string;
  infostashId: string;
  @IsString({
    message:
      'ensure text contains letters, numbers and punctuational characters',
  })
  image?: string;
  document?: string;
}

export class QueryInfostashTextRequest {
  vectorStoreName: string;
  theme: string;
  question;
}
