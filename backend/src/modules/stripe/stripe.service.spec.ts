import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { SupabaseService } from '../../database/supabase.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

/**
 * Unit tests for StripeService
 *
 * Tests payment processing, webhook handling, and subscription management
 */
describe('StripeService', () => {
  let service: StripeService;
  let mockStripe: any;
  let mockSupabase: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Set environment variables for credit packages
    process.env.STRIPE_PRICE_STARTER = 'price_starter_123';
    process.env.STRIPE_PRICE_STANDARD = 'price_standard_123';
    process.env.STRIPE_PRICE_PRO_PACK = 'price_pro_123';

    // Mock Stripe client methods
    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    // Mock Supabase service
    mockSupabase = {
      getUser: jest.fn(),
      updateUser: jest.fn(),
      getUserByStripeCustomerId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'stripe.secretKey': 'sk_test_123',
                'stripe.webhookSecret': 'whsec_test_123',
                'stripe.priceSubscription': 'price_sub_123',
                'stripe.priceStarter': 'price_starter_123',
                'stripe.priceStandard': 'price_standard_123',
                'stripe.priceProPack': 'price_pro_123',
                'STRIPE_SECRET_KEY': 'sk_test_123',
                'STRIPE_PRICE_SUBSCRIPTION': 'price_sub_123',
                'STRIPE_PRICE_STARTER': 'price_starter_123',
                'STRIPE_PRICE_STANDARD': 'price_standard_123',
                'STRIPE_PRICE_PRO_PACK': 'price_pro_123',
              };
              return config[key];
            }),
          },
        },
        {
          provide: SupabaseService,
          useValue: mockSupabase,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);

    // Replace the real Stripe client with our mock
    (service as any).stripe = mockStripe;
  });

  describe('getCreditPackages', () => {
    it('should return all credit packages', () => {
      const packages = service.getCreditPackages();

      expect(packages).toHaveLength(3);
      expect(packages[0].id).toBe('starter');
      expect(packages[1].id).toBe('standard');
      expect(packages[2].id).toBe('pro');
      expect(packages[1].popular).toBe(true);
    });

    it('should have correct pricing', () => {
      const packages = service.getCreditPackages();

      expect(packages[0].price).toBe(990);  // $9.90
      expect(packages[1].price).toBe(2490); // $24.90
      expect(packages[2].price).toBe(4990); // $49.90
    });

    it('should have correct credits', () => {
      const packages = service.getCreditPackages();

      expect(packages[0].credits).toBe(5);   // Starter
      expect(packages[1].credits).toBe(17);  // Standard (15 + 2 bonus)
      expect(packages[2].credits).toBe(40);  // Pro (35 + 5 bonus)
    });
  });

  describe('createCreditCheckout', () => {
    it('should create checkout session for valid package', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await service.createCreditCheckout(
        'user-123',
        'test@example.com',
        'standard',
      );

      expect(result).toEqual({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        customer_email: 'test@example.com',
        line_items: [
          {
            price: 'price_standard_123',
            quantity: 1,
          },
        ],
        success_url: expect.stringContaining('/payment/success'),
        cancel_url: expect.stringContaining('/pricing'),
        metadata: {
          userId: 'user-123',
          packageId: 'standard',
          credits: '17',
          type: 'credit_purchase',
        },
      });
    });

    it('should throw error for invalid package ID', async () => {
      await expect(
        service.createCreditCheckout('user-123', 'test@example.com', 'invalid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if price ID not configured', async () => {
      // Temporarily clear the price ID
      const packages = (service as any).creditPackages;
      const originalPriceId = packages[0].priceId;
      packages[0].priceId = '';

      await expect(
        service.createCreditCheckout('user-123', 'test@example.com', 'starter'),
      ).rejects.toThrow(InternalServerErrorException);

      // Restore
      packages[0].priceId = originalPriceId;
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API error'),
      );

      await expect(
        service.createCreditCheckout('user-123', 'test@example.com', 'standard'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createSubscriptionCheckout', () => {
    it('should create subscription checkout session', async () => {
      const mockSession = {
        id: 'cs_test_sub_123',
        url: 'https://checkout.stripe.com/pay/cs_test_sub_123',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const result = await service.createSubscriptionCheckout(
        'user-123',
        'test@example.com',
      );

      expect(result).toEqual({
        sessionId: 'cs_test_sub_123',
        url: 'https://checkout.stripe.com/pay/cs_test_sub_123',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer_email: 'test@example.com',
        line_items: [
          {
            price: 'price_sub_123',
            quantity: 1,
          },
        ],
        success_url: expect.stringContaining('/payment/success'),
        cancel_url: expect.stringContaining('/pricing'),
        metadata: {
          userId: 'user-123',
          type: 'subscription',
        },
      });
    });
  });

  describe('handleWebhook', () => {
    it('should verify webhook signature', async () => {
      const payload = Buffer.from('test payload');
      const signature = 'test_signature';
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { userId: 'user-123', type: 'credit_purchase', credits: '17' },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSupabase.getUser.mockResolvedValue({
        id: 'user-123',
        credits_remaining: 0,
      });
      mockSupabase.updateUser.mockResolvedValue({});

      await service.handleWebhook(payload, signature);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_test_123',
      );
    });

    it('should throw error for invalid signature', async () => {
      const payload = Buffer.from('test payload');
      const signature = 'invalid_signature';

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.handleWebhook(payload, signature)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle checkout.session.completed for credit purchase', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              userId: 'user-123',
              type: 'credit_purchase',
              packageId: 'standard',
              credits: '17',
            },
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSupabase.getUser.mockResolvedValue({
        id: 'user-123',
        credits_remaining: 5,
      });
      mockSupabase.updateUser.mockResolvedValue({});

      await service.handleWebhook(Buffer.from('payload'), 'signature');

      expect(mockSupabase.updateUser).toHaveBeenCalledWith('user-123', {
        plan: 'credits',
        credits_remaining: 22, // 5 + 17
      });
    });

    it('should handle checkout.session.completed for subscription', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              userId: 'user-123',
              type: 'subscription',
            },
            subscription: 'sub_123',
            customer: 'cus_123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      await service.handleWebhook(Buffer.from('payload'), 'signature');

      expect(mockSupabase.updateUser).toHaveBeenCalledWith('user-123', {
        plan: 'pro',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
      });
    });

    it('should handle customer.subscription.updated with active status', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSupabase.getUserByStripeCustomerId.mockResolvedValue({
        id: 'user-123',
        plan: 'free',
      });
      mockSupabase.updateUser.mockResolvedValue({});

      await service.handleWebhook(Buffer.from('payload'), 'signature');

      expect(mockSupabase.updateUser).toHaveBeenCalledWith('user-123', {
        plan: 'pro',
        stripe_subscription_id: 'sub_123',
      });
    });

    it('should handle customer.subscription.updated with canceled status', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'canceled',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSupabase.getUserByStripeCustomerId.mockResolvedValue({
        id: 'user-123',
        plan: 'pro',
      });
      mockSupabase.updateUser.mockResolvedValue({});

      await service.handleWebhook(Buffer.from('payload'), 'signature');

      expect(mockSupabase.updateUser).toHaveBeenCalledWith('user-123', {
        plan: 'free',
        analyses_used: 0,
        stripe_subscription_id: undefined,
      });
    });

    it('should handle customer.subscription.deleted', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSupabase.getUserByStripeCustomerId.mockResolvedValue({
        id: 'user-123',
        plan: 'pro',
      });
      mockSupabase.updateUser.mockResolvedValue({});

      await service.handleWebhook(Buffer.from('payload'), 'signature');

      expect(mockSupabase.updateUser).toHaveBeenCalledWith('user-123', {
        plan: 'free',
        analyses_used: 0,
        analyses_limit: 3,
        stripe_subscription_id: undefined,
      });
    });

    it('should handle missing userId gracefully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {},  // No userId
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      // Should not throw
      await service.handleWebhook(Buffer.from('payload'), 'signature');

      expect(mockSupabase.updateUser).not.toHaveBeenCalled();
    });

    it('should handle user not found in subscription update', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_nonexistent',
            status: 'active',
          },
        },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);
      mockSupabase.getUserByStripeCustomerId.mockResolvedValue(null);

      // Should not throw
      await service.handleWebhook(Buffer.from('payload'), 'signature');

      expect(mockSupabase.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('createPortalSession', () => {
    it('should create customer portal session', async () => {
      const mockPortalSession = {
        url: 'https://billing.stripe.com/session/test_123',
      };

      mockSupabase.getUser.mockResolvedValue({
        id: 'user-123',
        stripe_customer_id: 'cus_123',
      });
      mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession);

      const result = await service.createPortalSession('user-123');

      expect(result).toEqual({
        url: 'https://billing.stripe.com/session/test_123',
      });

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: expect.stringContaining('/account'),
      });
    });

    it('should throw error if user has no Stripe customer ID', async () => {
      mockSupabase.getUser.mockResolvedValue({
        id: 'user-123',
        stripe_customer_id: null,
      });

      await expect(service.createPortalSession('user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if user not found', async () => {
      mockSupabase.getUser.mockResolvedValue(null);

      await expect(service.createPortalSession('user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
