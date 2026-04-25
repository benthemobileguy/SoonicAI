import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  plan: 'free' | 'credits' | 'pro';
  analyses_used: number;
  analyses_limit: number;
  credits_remaining?: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  source_type: 'upload' | 'youtube';
  source_url?: string;
  file_name?: string;
  status: 'processing' | 'completed' | 'failed';
  detected_key?: string;
  tempo?: number;
  chords?: any;
  processing_time_seconds?: number;
  confidence?: number;
  created_at: string;
  completed_at?: string;
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    const supabaseUrl = this.config.get('supabase.url') || this.config.get('SUPABASE_URL');
    const supabaseKey = this.config.get('supabase.serviceKey') || this.config.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not configured. Database features disabled.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
    console.log('   URL:', supabaseUrl);
    console.log('   Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'missing');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // ==========================================
  // USER OPERATIONS
  // ==========================================

  /**
   * Get user profile by ID
   */
  async getUser(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  }

  /**
   * Create new user profile
   */
  async createUser(userId: string, email: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        plan: 'free',
        analyses_used: 0,
        analyses_limit: 3,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }

  /**
   * Increment user's analyses count (for free users) or decrement credits (for credit users)
   */
  async incrementAnalysisCount(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    // For free users: increment analyses_used
    if (user.plan === 'free') {
      await this.updateUser(userId, {
        analyses_used: user.analyses_used + 1,
      });
    }
    // For credit users: decrement credits_remaining
    else if (user.plan !== 'pro') {
      const newCredits = (user.credits_remaining || 0) - 1;
      await this.updateUser(userId, {
        credits_remaining: newCredits,
      });
    }
    // For pro users: do nothing (unlimited)
  }

  /**
   * Check if user has available analyses
   */
  async canUserAnalyze(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    // Pro users have unlimited
    if (user.plan === 'pro') return true;

    // Free users check their free analyses limit
    if (user.plan === 'free') {
      return user.analyses_used < user.analyses_limit;
    }

    // Credit users check if they have credits remaining
    return (user.credits_remaining || 0) > 0;
  }

  // ==========================================
  // ANALYSIS OPERATIONS
  // ==========================================

  /**
   * Create new analysis record
   */
  async createAnalysis(analysis: Partial<Analysis>): Promise<Analysis> {
    const { data, error } = await this.supabase
      .from('analyses')
      .insert(analysis)
      .select()
      .single();

    if (error) throw new Error(`Failed to create analysis: ${error.message}`);
    return data;
  }

  /**
   * Get analysis by ID
   */
  async getAnalysis(id: string, userId?: string): Promise<Analysis | null> {
    let query = this.supabase.from('analyses').select('*').eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get analysis: ${error.message}`);
    }

    return data;
  }

  /**
   * Update analysis
   */
  async updateAnalysis(id: string, updates: Partial<Analysis>): Promise<Analysis> {
    const { data, error } = await this.supabase
      .from('analyses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update analysis: ${error.message}`);
    return data;
  }

  /**
   * Get user's analyses
   */
  async getUserAnalyses(userId: string, limit = 10): Promise<Analysis[]> {
    const { data, error } = await this.supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get analyses: ${error.message}`);
    return data || [];
  }

  // ==========================================
  // AUTH VERIFICATION
  // ==========================================

  /**
   * Verify JWT token and get user
   */
  async verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return {
      userId: data.user.id,
      email: data.user.email || '',
    };
  }

  // ==========================================
  // STRIPE INTEGRATION
  // ==========================================

  /**
   * Get user by Stripe customer ID
   * Used for webhook processing when we only have the Stripe customer ID
   */
  async getUserByStripeCustomerId(customerId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get user by Stripe customer ID: ${error.message}`);
    }

    return data;
  }
}
