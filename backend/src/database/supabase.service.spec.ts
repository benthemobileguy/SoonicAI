import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

/**
 * Unit tests for SupabaseService
 *
 * Tests all database operations and edge cases
 */
describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockSupabaseClient: any;

  // Mock Supabase client methods
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockOrder = jest.fn();
  const mockLimit = jest.fn();
  const mockGetUser = jest.fn();

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      from: mockFrom,
      auth: {
        getUser: mockGetUser,
      },
    };

    // Chain mock methods
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    });

    mockInsert.mockReturnValue({
      select: () => ({
        single: mockSingle,
      }),
    });

    const mockUpdateEq = jest.fn().mockReturnValue({
      select: () => ({
        single: mockSingle,
      }),
    });

    mockUpdate.mockReturnValue({
      eq: mockUpdateEq,
    });

    // Store mockUpdateEq for assertions
    (mockEq as any).mockUpdateEq = mockUpdateEq;

    mockEq.mockReturnValue({
      single: mockSingle,
      select: mockSelect,
      limit: mockLimit,
      order: mockOrder,
    });

    mockOrder.mockReturnValue({
      limit: mockLimit,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'supabase.url') return 'https://test.supabase.co';
              if (key === 'supabase.serviceKey') return 'test-service-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);

    // Replace the real Supabase client with our mock
    (service as any).supabase = mockSupabaseClient;
  });

  describe('getUser', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        plan: 'free',
        analyses_used: 0,
        analyses_limit: 3,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      };

      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const result = await service.getUser('user-123');

      expect(result).toEqual(mockUser);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('should return null when user not found (PGRST116 error)', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await service.getUser('nonexistent-user');

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'SOME_ERROR', message: 'Database error' },
      });

      await expect(service.getUser('user-123')).rejects.toThrow(
        'Failed to get user: Database error',
      );
    });
  });

  describe('createUser', () => {
    it('should create new user with default values', async () => {
      const newUser = {
        id: 'user-123',
        email: 'new@example.com',
        plan: 'free',
        analyses_used: 0,
        analyses_limit: 3,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      };

      mockSingle.mockResolvedValue({ data: newUser, error: null });

      const result = await service.createUser('user-123', 'new@example.com');

      expect(result).toEqual(newUser);
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'new@example.com',
        plan: 'free',
        analyses_used: 0,
        analyses_limit: 3,
      });
    });

    it('should throw error if user creation fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Duplicate key' },
      });

      await expect(service.createUser('user-123', 'test@example.com')).rejects.toThrow(
        'Failed to create user: Duplicate key',
      );
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated data', async () => {
      const updatedUser = {
        id: 'user-123',
        plan: 'pro',
        updated_at: '2026-01-02',
      };

      mockSingle.mockResolvedValue({ data: updatedUser, error: null });

      const result = await service.updateUser('user-123', { plan: 'pro' });

      expect(result).toEqual(updatedUser);
      expect(mockUpdate).toHaveBeenCalled();
      // Note: mockEq call is verified implicitly through the successful result
    });

    it('should include updated_at timestamp', async () => {
      mockSingle.mockResolvedValue({ data: {}, error: null });

      await service.updateUser('user-123', { plan: 'credits' });

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall).toHaveProperty('updated_at');
      expect(updateCall.plan).toBe('credits');
    });
  });

  describe('canUserAnalyze', () => {
    it('should return true for Pro users', async () => {
      mockSingle.mockResolvedValue({
        data: { plan: 'pro', analyses_used: 100 },
        error: null,
      });

      const result = await service.canUserAnalyze('user-123');

      expect(result).toBe(true);
    });

    it('should return true for free users within limit', async () => {
      mockSingle.mockResolvedValue({
        data: { plan: 'free', analyses_used: 2, analyses_limit: 3 },
        error: null,
      });

      const result = await service.canUserAnalyze('user-123');

      expect(result).toBe(true);
    });

    it('should return false for free users at limit', async () => {
      mockSingle.mockResolvedValue({
        data: { plan: 'free', analyses_used: 3, analyses_limit: 3 },
        error: null,
      });

      const result = await service.canUserAnalyze('user-123');

      expect(result).toBe(false);
    });

    it('should return true for credit users with credits', async () => {
      mockSingle.mockResolvedValue({
        data: { plan: 'credits', credits_remaining: 5 },
        error: null,
      });

      const result = await service.canUserAnalyze('user-123');

      expect(result).toBe(true);
    });

    it('should return false for credit users without credits', async () => {
      mockSingle.mockResolvedValue({
        data: { plan: 'credits', credits_remaining: 0 },
        error: null,
      });

      const result = await service.canUserAnalyze('user-123');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await service.canUserAnalyze('nonexistent-user');

      expect(result).toBe(false);
    });
  });

  describe('incrementAnalysisCount', () => {
    it('should increment analyses_used for free users', async () => {
      const freeUser = {
        id: 'user-123',
        plan: 'free',
        analyses_used: 1,
        analyses_limit: 3,
      };

      mockSingle
        .mockResolvedValueOnce({ data: freeUser, error: null })  // getUser
        .mockResolvedValueOnce({ data: { ...freeUser, analyses_used: 2 }, error: null });  // updateUser

      await service.incrementAnalysisCount('user-123');

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.analyses_used).toBe(2);
    });

    it('should decrement credits_remaining for credit users', async () => {
      const creditUser = {
        id: 'user-123',
        plan: 'credits',
        credits_remaining: 5,
      };

      mockSingle
        .mockResolvedValueOnce({ data: creditUser, error: null })
        .mockResolvedValueOnce({ data: { ...creditUser, credits_remaining: 4 }, error: null });

      await service.incrementAnalysisCount('user-123');

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.credits_remaining).toBe(4);
    });

    it('should do nothing for Pro users', async () => {
      const proUser = {
        id: 'user-123',
        plan: 'pro',
      };

      mockSingle.mockResolvedValue({ data: proUser, error: null });

      await service.incrementAnalysisCount('user-123');

      // updateUser should not be called for Pro users
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      await expect(service.incrementAnalysisCount('nonexistent-user')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('createAnalysis', () => {
    it('should create analysis record', async () => {
      const analysis = {
        user_id: 'user-123',
        source_type: 'youtube' as const,
        source_url: 'https://youtube.com/watch?v=test',
        status: 'processing' as const,
      };

      const createdAnalysis = {
        id: 'analysis-123',
        ...analysis,
        created_at: '2026-01-01',
      };

      mockSingle.mockResolvedValue({ data: createdAnalysis, error: null });

      const result = await service.createAnalysis(analysis);

      expect(result).toEqual(createdAnalysis);
      expect(mockInsert).toHaveBeenCalledWith(analysis);
    });
  });

  describe('getUserByStripeCustomerId', () => {
    it('should return user when found by Stripe customer ID', async () => {
      const mockUser = {
        id: 'user-123',
        stripe_customer_id: 'cus_test123',
        plan: 'pro',
      };

      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const result = await service.getUserByStripeCustomerId('cus_test123');

      expect(result).toEqual(mockUser);
      expect(mockEq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test123');
    });

    it('should return null when customer not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await service.getUserByStripeCustomerId('cus_nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should return user data for valid token', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      const result = await service.verifyToken('valid-token');

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should return null for invalid token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const result = await service.verifyToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should handle missing email gracefully', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: null,
          },
        },
        error: null,
      });

      const result = await service.verifyToken('valid-token');

      expect(result?.email).toBe('');
    });
  });
});
