import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticlesController],
  providers: [ArticlesService, KafkaService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
