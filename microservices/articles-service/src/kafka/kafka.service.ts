import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const kafkaBrokers = this.configService.get('KAFKA_BROKERS');

    // Skip Kafka if not configured
    if (!kafkaBrokers) {
      console.log('⚠️  Kafka not configured, skipping initialization');
      return;
    }

    this.kafka = new Kafka({
      clientId: this.configService.get('SERVICE_NAME') || 'articles-service',
      brokers: kafkaBrokers.split(','),
    });

    this.producer = this.kafka.producer();

    try {
      await this.producer.connect();
      console.log('✅ Kafka Producer connecté');
    } catch (error) {
      console.error('❌ Erreur connexion Kafka:', error);
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async publishEvent(topic: string, event: any) {
    // Skip if Kafka is not initialized
    if (!this.producer) {
      console.log(`⚠️  Kafka not available, skipping event publish to ${topic}:`, event.eventType);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.articleId || event.entityId,
            value: JSON.stringify(event),
            headers: {
              'event-type': event.eventType,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });
      console.log(`📤 Event published to ${topic}:`, event.eventType);
    } catch (error) {
      console.error(`❌ Error publishing to ${topic}:`, error);
    }
  }
}
