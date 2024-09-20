import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private connectionString: string;

  async onModuleInit() {
    await this.connect();
  }

  async consumeMessages(
    queueName: string,
    callback: (msg: amqp.ConsumeMessage | null, ack: (multiple?: boolean) => void) => void,
  ) {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel.checkQueue(queueName);
    await this.channel.consume(queueName, (msg) => {
      if (msg !== null) {
        callback(msg, (multiple = false) => this.channel.ack(msg, multiple));
      }
    }, { noAck: false });
  }

  async sendMessage(queueName: string, message: string) {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel.checkQueue(queueName);
    this.channel.sendToQueue(queueName, Buffer.from(message));
  }

  public channelInstance() {
    return this.channel;
  }

  private async connect() {
    try {
      this.connectionString = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
      this.connection = await amqp.connect(this.connectionString);
      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(1);
      this.logger.debug('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Error connecting to RabbitMQ', error);
    }
  }
}
