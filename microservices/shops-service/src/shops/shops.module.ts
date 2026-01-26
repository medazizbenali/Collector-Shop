import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { Shop } from './entities/shop.entity';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  controllers: [ShopsController],
  providers: [ShopsService, KafkaService],
  exports: [ShopsService],
})
export class ShopsModule {}
