import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  InfostashViewModel,
  RecentInfostash,
} from '@app/domain/infostash/infostash.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true })
  tenantUUID: string;

  @Prop({ unique: true })
  email: string;
  // last 10 info projects
  @Prop()
  infostashes?: RecentInfostash[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export class UserViewModel {
  _id: Types.ObjectId;
  createdDateTime: string;
  lastModifiedDateTime: string;
  version: number;
  tenantUUID: string;
  email: string;
  infostashes: InfostashViewModel[];
}
