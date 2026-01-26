import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private ordersService: OrdersService;

  constructor(private configService: ConfigService) {}

  setOrdersService(ordersService: OrdersService) {
    this.ordersService = ordersService;
  }

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: this.configService.get('SERVICE_NAME') || 'orders-service',
      brokers: this.configService.get('KAFKA_BROKERS').split(','),
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'orders-service-group' });

    try {
      await this.producer.connect();
      console.log('✅ Kafka Producer connecté');
    } catch (error) {
      console.error('❌ Erreur connexion Kafka Producer:', error);
    }

    try {
      await this.consumer.connect();
      console.log('✅ Kafka Consumer connecté');

      // S'abonner aux topics
      await this.consumer.subscribe({ topic: 'payment.events', fromBeginning: false });

      // Consommer les messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const event = JSON.parse(message.value.toString());
          await this.handleEvent(topic, event);
        },
      });
    } catch (error) {
      console.error('❌ Erreur connexion Kafka Consumer:', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async publishEvent(topic: string, event: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.orderId || event.entityId,
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

  private async handleEvent(topic: string, event: any) {
    console.log(`📥 Event received from ${topic}:`, event.eventType);

    try {
      if (topic === 'payment.events') {
        if (event.eventType === 'PAYMENT_SUCCESS') {
          // Marquer la commande comme payée
          if (this.ordersService && event.orderId) {
            await this.ordersService.markAsPaid(event.orderId);
            console.log(`✅ Order ${event.orderId} marked as PAID`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error handling event from ${topic}:`, error);
    }
  }
}
