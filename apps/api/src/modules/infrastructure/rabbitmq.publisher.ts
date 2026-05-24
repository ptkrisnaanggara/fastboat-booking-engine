import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { Channel, Connection } from 'amqplib';

@Injectable()
export class RabbitMqPublisher implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqPublisher.name);
  private connection?: Connection;
  private channel?: Channel;

  constructor(private readonly config: ConfigService) {}

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;

    this.connection = await amqp.connect(this.config.get<string>('RABBITMQ_URL', 'amqp://localhost:5672'));
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange('fastboat.events', 'topic', { durable: true });

    return this.channel;
  }

  async publish(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    const channel = await this.getChannel();
    const message = Buffer.from(JSON.stringify(payload));

    channel.publish('fastboat.events', routingKey, message, {
      contentType: 'application/json',
      persistent: true,
      messageId: `${routingKey}:${payload.id ?? Date.now()}`,
      timestamp: Date.now(),
    });

    this.logger.log(`Published event ${routingKey}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
