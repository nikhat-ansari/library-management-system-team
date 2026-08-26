import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController { @Get() status() { return { status: 'ok', service: process.env.SERVICE_NAME ?? 'auth-service' }; } }
