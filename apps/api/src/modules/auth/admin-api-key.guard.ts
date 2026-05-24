import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expectedKey = this.config.get<string>('ADMIN_API_KEY');

    if (!expectedKey) {
      throw new UnauthorizedException('ADMIN_API_KEY is not configured');
    }

    const providedKey = request.header('x-admin-api-key');

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    return true;
  }
}
