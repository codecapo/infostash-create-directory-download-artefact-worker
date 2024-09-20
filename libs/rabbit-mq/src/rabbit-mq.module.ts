import { Module } from '@nestjs/common';
import { RabbitMQService } from '@app/rabbit-mq/rabbit-mq.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMqModule {}
