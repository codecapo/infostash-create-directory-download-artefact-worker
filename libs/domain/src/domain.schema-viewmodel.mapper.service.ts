import {
  InfostashDocument,
  InfostashViewModel,
  RecentInfostash,
} from '@app/domain/infostash/infostash.schema';
import {
  createdAt,
  updatedAt,
  version,
} from '@app/domain/domain.fieldname.constants';
import { Injectable } from '@nestjs/common';
import {
  UserDocument,
  UserViewModel,
} from '@app/domain/user/schema/user.schema';

@Injectable()
export class DomainSchemaViewmodelMapperService {
  public async mapInfostashSchemaToRecentInfostashViewModel(
    infostash: InfostashDocument,
  ) {
    const recentInfoStash: RecentInfostash = {
      _id: infostash._id,
      userId: infostash.userId,
      name: infostash.name,
      summary: infostash.summary,
      createdAt: infostash.get(createdAt),
      updatedAt: infostash.get(updatedAt),
      __v: infostash.get(version),
      imageEmbeddingClassName: infostash.textEmbeddingClassName,
      textEmbeddingClassName: infostash.imageEmbeddingClassName,
    };
    return recentInfoStash;
  }

  public async mapUserSchemaToUserViewModel(
    user: UserDocument,
  ): Promise<UserViewModel> {
    const mappedInfostashViewModel: InfostashViewModel[] = user.infostashes.map(
      (item) => {
        const infostashViewModel: InfostashViewModel = {
          oId: item._id,
          userId: item.userId,
          createdDateTime: item.createdAt,
          modifiedDateTime: item.updatedAt,
          name: item.name,
          summary: item.summary,
          textEmbeddingClassName: item.textEmbeddingClassName,
          imageEmbeddingClassName: item.imageEmbeddingClassName,
          version: item.__v,
        };
        return infostashViewModel;
      },
    );

    return {
      _id: user._id,
      createdDateTime: user.get('createdAt'),
      lastModifiedDateTime: user.get('updatedAt'),
      version: 0,
      tenantUUID: user.tenantUUID,
      email: user.email,
      infostashes: mappedInfostashViewModel,
    };
  }
}
