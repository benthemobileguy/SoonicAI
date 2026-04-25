import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { StripeService } from './stripe.service';
import { SupabaseAuthGuard } from '../../guards/supabase-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  /**
   * Get available credit packages
   */
  @Get('packages')
  getPackages() {
    return {
      packages: this.stripeService.getCreditPackages(),
    };
  }

  /**
   * Create checkout session for credit purchase
   */
  @Post('checkout/credits')
  @UseGuards(SupabaseAuthGuard)
  async createCreditCheckout(
    @CurrentUser() user: { userId: string; email: string },
    @Body() dto: CreateCheckoutDto,
  ) {
    const { sessionId, url } = await this.stripeService.createCreditCheckout(
      user.userId,
      user.email,
      dto.packageId,
    );

    return {
      sessionId,
      url,
    };
  }

  /**
   * Create checkout session for Pro subscription
   */
  @Post('checkout/subscription')
  @UseGuards(SupabaseAuthGuard)
  async createSubscriptionCheckout(
    @CurrentUser() user: { userId: string; email: string },
  ) {
    const { sessionId, url } = await this.stripeService.createSubscriptionCheckout(
      user.userId,
      user.email,
    );

    return {
      sessionId,
      url,
    };
  }

  /**
   * Create customer portal session (for managing subscription)
   */
  @Post('portal')
  @UseGuards(SupabaseAuthGuard)
  async createPortalSession(
    @CurrentUser() user: { userId: string },
  ) {
    const { url } = await this.stripeService.createPortalSession(user.userId);

    return { url };
  }

  /**
   * Webhook endpoint for Stripe events
   *
   * IMPORTANT: This endpoint must have raw body parsing enabled
   * See main.ts for configuration
   *
   * Note: Rate limiting is disabled for webhooks since Stripe
   * retries failed deliveries and we don't want to block legitimate retries
   */
  @SkipThrottle()
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const payload = request.rawBody;

    if (!payload) {
      throw new Error('No raw body available');
    }

    await this.stripeService.handleWebhook(payload, signature);

    return { received: true };
  }
}
