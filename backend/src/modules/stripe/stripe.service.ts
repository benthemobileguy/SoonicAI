import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SupabaseService } from '../../database/supabase.service';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string;
  popular?: boolean;
}

@Injectable()
export class StripeService {
  private stripe: any = null;
  private readonly secretKey: string | undefined;
  private readonly webhookSecret: string | undefined;

  // Credit packages based on PRICING_STRATEGY.md
  private readonly creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 5,
      price: 990, // $9.90 in cents
      priceId: process.env.STRIPE_PRICE_STARTER || '',
    },
    {
      id: 'standard',
      name: 'Standard Pack',
      credits: 17, // 15 + 2 bonus
      price: 2490, // $24.90 in cents
      priceId: process.env.STRIPE_PRICE_STANDARD || '',
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 40, // 35 + 5 bonus
      price: 4990, // $49.90 in cents
      priceId: process.env.STRIPE_PRICE_PRO_PACK || '',
    },
  ];

  constructor(
    private config: ConfigService,
    private supabase: SupabaseService,
  ) {
    this.secretKey = this.config.get('stripe.secretKey') || this.config.get('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.get('stripe.webhookSecret') || this.config.get('STRIPE_WEBHOOK_SECRET');

    if (!this.secretKey) {
      console.warn('⚠️  Stripe secret key not configured. Payment features disabled.');
      return;
    }

    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2026-04-22.dahlia' as any,
    });

    console.log('✅ Stripe client initialized');
  }

  /**
   * Get available credit packages
   */
  getCreditPackages(): CreditPackage[] {
    return this.creditPackages;
  }

  /**
   * Create checkout session for credit purchase
   */
  async createCreditCheckout(
    userId: string,
    email: string,
    packageId: string,
  ): Promise<{ sessionId: string; url: string }> {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe not configured');
    }

    // Find the package
    const pkg = this.creditPackages.find((p) => p.id === packageId);
    if (!pkg) {
      throw new BadRequestException('Invalid package ID');
    }

    if (!pkg.priceId) {
      throw new InternalServerErrorException(`Price ID not configured for ${pkg.name}`);
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price: pkg.priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: {
          userId,
          packageId: pkg.id,
          credits: pkg.credits.toString(),
          type: 'credit_purchase',
        },
      });

      console.log(`[Stripe] Created checkout session for ${email}: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('[Stripe] Failed to create checkout session:', error.message);
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }

  /**
   * Create checkout session for Pro subscription
   */
  async createSubscriptionCheckout(
    userId: string,
    email: string,
  ): Promise<{ sessionId: string; url: string }> {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe not configured');
    }

    const subscriptionPriceId = this.config.get('stripe.priceSubscription') ||
                                 this.config.get('STRIPE_PRICE_SUBSCRIPTION');

    if (!subscriptionPriceId) {
      throw new InternalServerErrorException('Subscription price ID not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price: subscriptionPriceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: {
          userId,
          type: 'subscription',
        },
      });

      console.log(`[Stripe] Created subscription checkout for ${email}: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('[Stripe] Failed to create subscription checkout:', error.message);
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe not configured');
    }

    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      console.error('[Stripe] Webhook signature verification failed:', error.message);
      throw new BadRequestException('Invalid signature');
    }

    console.log(`[Stripe] Received webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as any);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as any);
        break;

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful checkout completion
   */
  private async handleCheckoutCompleted(session: any): Promise<void> {
    const { userId, type, packageId, credits } = session.metadata || {};

    if (!userId) {
      console.error('[Stripe] No userId in session metadata');
      return;
    }

    console.log(`[Stripe] Processing checkout for user ${userId}, type: ${type}`);

    if (type === 'credit_purchase') {
      await this.handleCreditPurchase(userId, packageId, parseInt(credits || '0'), session);
    } else if (type === 'subscription') {
      await this.handleSubscriptionCreated(userId, session);
    }
  }

  /**
   * Handle credit purchase
   */
  private async handleCreditPurchase(
    userId: string,
    packageId: string,
    credits: number,
    session: any,
  ): Promise<void> {
    const user = await this.supabase.getUser(userId);
    if (!user) {
      console.error(`[Stripe] User not found: ${userId}`);
      return;
    }

    // Add credits to user's account
    const newCredits = (user.credits_remaining || 0) + credits;

    await this.supabase.updateUser(userId, {
      plan: 'credits',
      credits_remaining: newCredits,
    });

    // Record the purchase
    // Note: We'll add this to the database later if needed
    console.log(`[Stripe] Added ${credits} credits to user ${userId}. New balance: ${newCredits}`);

    // TODO: Send confirmation email
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(
    userId: string,
    session: any,
  ): Promise<void> {
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) {
      console.error('[Stripe] No subscription ID in session');
      return;
    }

    await this.supabase.updateUser(userId, {
      plan: 'pro',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
    });

    console.log(`[Stripe] Upgraded user ${userId} to Pro plan. Subscription: ${subscriptionId}`);

    // TODO: Send welcome email
  }

  /**
   * Handle subscription updated (renewal, payment failed, etc.)
   *
   * Handles subscription status changes:
   * - active: Subscription is active and paid
   * - past_due: Payment failed, waiting for retry
   * - unpaid: All payment retries failed
   * - canceled: Subscription was canceled
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id as string;
    const status = subscription.status as string;

    console.log(`[Stripe] Subscription updated: ${subscriptionId}, Status: ${status}`);

    // Find user by stripe_customer_id
    const user = await this.supabase.getUserByStripeCustomerId(customerId);

    if (!user) {
      console.error(`[Stripe] User not found for customer ${customerId}`);
      return;
    }

    // Handle different subscription statuses
    switch (status) {
      case 'active':
        // Subscription is active - ensure user has Pro access
        if (user.plan !== 'pro') {
          await this.supabase.updateUser(user.id, {
            plan: 'pro',
            stripe_subscription_id: subscriptionId,
          });
          console.log(`[Stripe] Restored Pro access for user ${user.id}`);
        }
        break;

      case 'past_due':
        // Payment failed but subscription not canceled yet
        // Keep Pro access but log the issue
        console.warn(`[Stripe] Subscription ${subscriptionId} is past due for user ${user.id}`);
        // Stripe will retry payment automatically
        // Consider sending email notification to user
        break;

      case 'unpaid':
      case 'canceled':
        // Payment failed after all retries OR subscription was canceled
        // Downgrade user to free plan
        await this.supabase.updateUser(user.id, {
          plan: 'free',
          analyses_used: 0,  // Reset free analyses
          stripe_subscription_id: undefined,  // Clear subscription ID
        });
        console.log(`[Stripe] Downgraded user ${user.id} to free plan (status: ${status})`);
        // TODO: Send email notification
        break;

      case 'trialing':
        // User is in trial period - grant Pro access
        if (user.plan !== 'pro') {
          await this.supabase.updateUser(user.id, {
            plan: 'pro',
            stripe_subscription_id: subscriptionId,
          });
          console.log(`[Stripe] Granted trial Pro access for user ${user.id}`);
        }
        break;

      default:
        console.log(`[Stripe] Unhandled subscription status: ${status}`);
    }
  }

  /**
   * Handle subscription deleted/canceled
   *
   * This event is sent when a subscription is completely canceled.
   * Downgrade the user to free plan and reset their usage.
   */
  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id as string;

    console.log(`[Stripe] Subscription deleted: ${subscriptionId} for customer ${customerId}`);

    // Find user by stripe_customer_id
    const user = await this.supabase.getUserByStripeCustomerId(customerId);

    if (!user) {
      console.error(`[Stripe] User not found for customer ${customerId}`);
      return;
    }

    // Downgrade user to free plan
    await this.supabase.updateUser(user.id, {
      plan: 'free',
      analyses_used: 0,  // Reset free analyses count
      analyses_limit: 3,  // Restore free tier limit
      stripe_subscription_id: undefined,  // Clear subscription ID
    });

    console.log(`[Stripe] User ${user.id} downgraded to free plan after subscription deletion`);

    // TODO: Send cancellation confirmation email
    // TODO: Optionally save cancellation reason for analytics
  }

  /**
   * Create customer portal session (for managing subscription)
   */
  async createPortalSession(userId: string): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe not configured');
    }

    const user = await this.supabase.getUser(userId);
    if (!user || !user.stripe_customer_id) {
      throw new BadRequestException('No Stripe customer found');
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: `${process.env.FRONTEND_URL}/account`,
      });

      return { url: session.url };
    } catch (error) {
      console.error('[Stripe] Failed to create portal session:', error.message);
      throw new InternalServerErrorException('Failed to create portal session');
    }
  }
}
