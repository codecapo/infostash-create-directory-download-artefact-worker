import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMqModule } from '@app/rabbit-mq';
import { ConfigModule } from '@nestjs/config';
import { DigitalOceanSpacesModule } from '@app/digital-ocean-spaces';
import { AppWorker } from './app.worker';
import { AppMapper } from './app.mapper';
import { TransactionalInboxOutboxModule } from '@app/transactional-inbox-outbox';
import { MongooseModule } from '@nestjs/mongoose';
import { AppTransactionService } from './app.transaction.service';
import { WorkflowModule } from '../libs/workflow';
import { DomainModule } from '@app/domain';
import { MongodbModule } from '@app/mongodb';

@Module({
  imports: [
    RabbitMqModule,
    DigitalOceanSpacesModule,
    ConfigModule.forRoot(),
    TransactionalInboxOutboxModule,
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING, {
      dbName: process.env.DB_NAME,
    }),
    WorkflowModule,
    DomainModule,
    MongodbModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppWorker, AppMapper, AppTransactionService],
})
export class AppModule {}
