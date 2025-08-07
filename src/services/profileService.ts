import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  wallet_address: string;
  twitter_username?: string;
  twitter_name?: string;
  profile_image_url?: string;
  referral_code: string;
  referred_by?: string;
  balance: number;
  total_referrals: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  from_profile_id?: string;
  to_profile_id?: string;
  amount: number;
  transaction_type: 'send' | 'receive' | 'referral_bonus' | 'welcome_bonus';
  tx_hash?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export const profileService = {
  // Create or get user profile
  async upsertProfile(userData: {
    user_id: string;
    wallet_address: string;
    twitter_username?: string;
    twitter_name?: string;
    profile_image_url?: string;
    referral_code?: string;
  }): Promise<Profile> {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user_id)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to fetch profile: ${fetchError.message}`);
    }

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile using the registration function
    const { data, error } = await supabase.rpc('handle_user_registration', {
      p_user_id: userData.user_id,
      p_wallet_address: userData.wallet_address,
      p_twitter_username: userData.twitter_username,
      p_twitter_name: userData.twitter_name,
      p_profile_image_url: userData.profile_image_url,
      p_referral_code: userData.referral_code,
    });

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    // Fetch the newly created profile
    const { data: newProfile, error: newError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data)
      .single();

    if (newError) {
      throw new Error(`Failed to fetch new profile: ${newError.message}`);
    }

    return newProfile;
  },

  // Get profile by user ID
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  },

  // Get profile by referral code
  async getProfileByReferralCode(referralCode: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('referral_code', referralCode)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile by referral code: ${error.message}`);
    }

    return data;
  },

  // Update profile balance
  async updateBalance(profileId: string, newBalance: number): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', profileId);

    if (error) {
      throw new Error(`Failed to update balance: ${error.message}`);
    }
  },
};

export const transactionService = {
  // Get user transactions
  async getUserTransactions(profileId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_profile_id.eq.${profileId},to_profile_id.eq.${profileId}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return (data || []) as Transaction[];
  },

  // Create transaction
  async createTransaction(transaction: {
    from_profile_id?: string;
    to_profile_id?: string;
    amount: number;
    transaction_type: Transaction['transaction_type'];
    tx_hash?: string;
    status?: Transaction['status'];
  }): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return data as Transaction;
  },

  // Update transaction status
  async updateTransactionStatus(id: string, status: Transaction['status'], txHash?: string): Promise<void> {
    const updateData: { status: Transaction['status']; tx_hash?: string } = { status };
    if (txHash) {
      updateData.tx_hash = txHash;
    }

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  },
};