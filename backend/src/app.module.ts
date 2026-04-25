import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { DatabaseModule } from './database/database.module';
import { StripeModule } from './modules/stripe/stripe.module';
import configuration from './config/configuration';
import { validationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: validationSchema,
      validationOptions: {
        abortEarly: false,  // Show all validation errors, not just the first one
        allowUnknown: true,  // Allow environment variables not in schema (e.g., system vars)
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 3,   // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 seconds
        limit: 20,   // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minute
        limit: 100,  // 100 requests per minute
      },
    ]),
    DatabaseModule,
    AnalysisModule,
    StripeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,  // Apply rate limiting globally
    },
  ],
})
export class AppModule {}
