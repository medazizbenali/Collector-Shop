import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const role = request.query?.role || 'buyer';

    // Encode role in state parameter
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');

    console.log(`🔵 [GoogleAuthGuard] Role: ${role}, State: ${state}`);

    return {
      state,
      prompt: 'select_account',
    };
  }
}
