import { Controller, Get, Post, Body, Req, Res, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('auth/google/login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Query('role') role?: string) {
    // Le rôle sera géré par GoogleAuthGuard via le state parameter
    // Passport va automatiquement gérer la redirection vers Google
  }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?token=${token.access_token}&refreshToken=${token.refresh_token}`);
  }

  @Post('auth/refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('auth/profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    return {
      message: 'Profile retrieved successfully',
      data: req.user,
    };
  }

  @Post('auth/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request) {
    return { message: 'Logged out successfully' };
  }
}
