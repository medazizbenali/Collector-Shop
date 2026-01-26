import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { RedisModule } from '../redis/redis.module';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  imports: [RedisModule],
  controllers: [CartController],
  providers: [CartService, KafkaService],
})
export class CartModule {}
