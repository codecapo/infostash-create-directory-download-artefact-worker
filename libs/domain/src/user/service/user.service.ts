import { Injectable, Logger } from '@nestjs/common';
import { UserRepo } from '@app/domain/user/repo/user.repo';
import { Types } from 'mongoose';
import { RecentInfostash } from '@app/domain/infostash/infostash.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepo: UserRepo) {}

  public async createUserProfile(email: string) {
    return await this.userRepo.createUserProfile(email);
  }

  public async getUserProfile(userId: string) {
    return await this.userRepo.getUserProfile(userId);
  }

  public async updateUserProfileWithMostRecentInfostash(
    userId: Types.ObjectId,
    infostash: RecentInfostash,
  ) {
    return await this.userRepo.addRecentInfostashesToUserProfileAndRemoveOlderEntries(
      userId,
      infostash,
    );
  }
}
