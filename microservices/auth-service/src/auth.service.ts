import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private kafkaService: KafkaService,
  ) {}

  async validateGoogleUser(profile: any, requestedRole?: string): Promise<User> {
    const { id, emails, displayName, photos, name } = profile;
    const email = emails[0].value;

    let user = await this.userRepository.findOne({ where: { googleId: id } });

    if (!user) {
      // Déterminer le rôle basé sur le paramètre requestedRole
      let role = UserRole.BUYER; // Par défaut
      if (requestedRole === 'seller') {
        role = UserRole.SELLER;
      } else if (requestedRole === 'admin') {
        role = UserRole.ADMIN;
      }

      user = this.userRepository.create({
        googleId: id,
        email,
        firstName: name?.givenName || displayName,
        lastName: name?.familyName || '',
        avatarUrl: photos?.[0]?.value,
        role,
      });
      user = await this.userRepository.save(user);

      await this.kafkaService.publishEvent('user.events', {
        eventType: 'USER_REGISTERED',
        userId: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Nouvel utilisateur créé: ${user.email} avec le rôle ${role}`);
    } else {
      await this.kafkaService.publishEvent('user.events', {
        eventType: 'USER_LOGGED_IN',
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new Error('User not found');
      }

      return this.login(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
