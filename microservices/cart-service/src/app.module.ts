import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis/redis.module';
import { CartModule } from './cart/cart.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { KafkaService } from './kafka/kafka.service';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    CartModule,
  ],
  controllers: [HealthController],
  providers: [JwtStrategy, KafkaService],
})
export class AppModule {}
