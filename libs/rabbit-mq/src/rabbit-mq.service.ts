import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
    private readonly logger = new Logger(RabbitMQService.name)
    private connection: amqp.Connection;
    private channel: amqp.Channel;
    private connectionString: string;

    async onModuleInit() {
        await this.connect();
    }

    private async connect() {
        try {
            this.connectionString = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
            this.connection = await amqp.connect(this.connectionString);
            this.channel = await this.connection.createChannel();
            this.logger.debug('Connected to RabbitMQ');
        } catch (error) {
            this.logger.error('Error connecting to RabbitMQ', error);
        }
    }

    async consumeMessages(queueName: string, callback: (msg: amqp.ConsumeMessage | null) => void) {
        if (!this.channel) {
            await this.connect();
        }

        await this.channel.assertQueue(queueName, { durable: true });
        await this.channel.consume(queueName, (msg) => {
            if (msg !== null) {
                callback(msg);
                this.channel.ack(msg);
            }
        });
    }

    async sendMessage(queueName: string, message: string) {
        if (!this.channel) {
            await this.connect();
        }

        await this.channel.assertQueue(queueName, { durable: true });
        this.channel.sendToQueue(queueName, Buffer.from(message));
    }
}