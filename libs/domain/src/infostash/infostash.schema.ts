import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';
import ContentBlock = Anthropic.ContentBlock;

export type InfostashDocument = HydratedDocument<Infostash>;

@Schema({
  timestamps: true,
})
export class Infostash {
  @Prop()
  name: string;

  @Prop()
  summary: string;

  @Prop()
  userId: Types.ObjectId;

  @Prop()
  textEmbeddingClassName: string;

  @Prop()
  imageEmbeddingClassName: string;

  @Prop()
  textArtefacts?: TextArtefact[];

  @Prop()
  mediaArtefacts?: MediaArtefact[];
}

export const InfostashSchema = SchemaFactory.createForClass(Infostash);

export class RecentInfostash {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  __v: number;
  name: string;
  summary: string;
  textEmbeddingClassName: string;
  imageEmbeddingClassName: string;
  textArtefacts?: TextArtefact[];
  mediaArtefacts?: MediaArtefact[];
}

export class TextArtefact {
  textArtefactId: Types.ObjectId;
  content: string;
  extractedSentences: ContentBlock[];
}

export class MediaArtefact {
  mediaArtefactId: Types.ObjectId;
  contentMediaType: string;
  contentLocation: string;
  originalFileName: string;
  extractedSentences?: ExtractedSentences;
}

export class ExtractedSentences {
  rawOutputBlock: string;
  extractedSentencesOutput: string[];
}

export class InfostashViewModel {
  oId: Types.ObjectId;
  userId: Types.ObjectId;
  createdDateTime: string;
  modifiedDateTime: string;
  version: number;
  name: string;
  summary: string;
  textEmbeddingClassName: string;
  imageEmbeddingClassName: string;
}

export class TextDataImport {
  content: string;
  tenantUUID: string;
}
