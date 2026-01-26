import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true, // Enable request object in validate
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Extract role from state parameter
      let requestedRole = 'buyer'; // Default role

      console.log(`🟢 [GoogleStrategy] validate() - req.query.state:`, req.query?.state);

      if (req.query?.state) {
        try {
          const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
          requestedRole = stateData.role || 'buyer';
          console.log(`✅ [GoogleStrategy] Decoded role from state: ${requestedRole}`);
        } catch (e) {
          console.warn('❌ [GoogleStrategy] Failed to parse state parameter:', e);
        }
      } else {
        console.warn('⚠️ [GoogleStrategy] No state parameter found in req.query');
      }

      console.log(`🟡 [GoogleStrategy] Creating user with role: ${requestedRole}`);
      const user = await this.authService.validateGoogleUser(profile, requestedRole);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
