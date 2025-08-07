-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Privy user ID
  wallet_address TEXT NOT NULL,
  twitter_username TEXT,
  twitter_name TEXT,
  profile_image_url TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  balance DECIMAL(20, 8) DEFAULT 10.0, -- Welcome bonus
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(20, 8) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on referral_code for quick lookups
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true); -- Allow anyone to create a profile initially

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = current_setting('app.current_user_id', true));

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_profile_id UUID REFERENCES public.profiles(id),
  to_profile_id UUID REFERENCES public.profiles(id),
  amount DECIMAL(20, 8) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('send', 'receive', 'referral_bonus', 'welcome_bonus')),
  tx_hash TEXT, -- Solana transaction hash
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  from_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = current_setting('app.current_user_id', true)
  ) OR 
  to_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = current_setting('app.current_user_id', true)
  )
);

CREATE POLICY "Users can insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

-- Create referral_levels table for multi-level tracking
CREATE TABLE public.referral_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for referral levels
ALTER TABLE public.referral_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for referral levels
CREATE POLICY "Users can view referral levels" 
ON public.referral_levels 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert referral levels" 
ON public.referral_levels 
FOR INSERT 
WITH CHECK (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(wallet_addr TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Use last 6 characters of wallet address
  base_code := UPPER(RIGHT(wallet_addr, 6));
  final_code := base_code;
  
  -- Check if code exists and add counter if needed
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration and referral tracking
CREATE OR REPLACE FUNCTION handle_user_registration(
  p_user_id TEXT,
  p_wallet_address TEXT,
  p_twitter_username TEXT DEFAULT NULL,
  p_twitter_name TEXT DEFAULT NULL,
  p_profile_image_url TEXT DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_profile_id UUID;
  referrer_profile_id UUID;
  new_referral_code TEXT;
  current_level INTEGER;
  current_referrer_id UUID;
  i INTEGER;
BEGIN
  -- Generate unique referral code
  new_referral_code := generate_referral_code(p_wallet_address);
  
  -- Find referrer if referral code provided
  IF p_referral_code IS NOT NULL THEN
    SELECT id INTO referrer_profile_id 
    FROM public.profiles 
    WHERE referral_code = p_referral_code;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (
    user_id, 
    wallet_address, 
    twitter_username, 
    twitter_name, 
    profile_image_url, 
    referral_code, 
    referred_by
  ) VALUES (
    p_user_id, 
    p_wallet_address, 
    p_twitter_username, 
    p_twitter_name, 
    p_profile_image_url, 
    new_referral_code, 
    referrer_profile_id
  ) RETURNING id INTO new_profile_id;
  
  -- Create welcome bonus transaction
  INSERT INTO public.transactions (
    to_profile_id, 
    amount, 
    transaction_type, 
    status
  ) VALUES (
    new_profile_id, 
    10.0, 
    'welcome_bonus', 
    'completed'
  );
  
  -- Handle referral chain if referrer exists
  IF referrer_profile_id IS NOT NULL THEN
    current_referrer_id := referrer_profile_id;
    current_level := 1;
    
    -- Track up to 5 levels of referrals
    FOR i IN 1..5 LOOP
      EXIT WHEN current_referrer_id IS NULL;
      
      -- Insert referral level tracking
      INSERT INTO public.referral_levels (
        profile_id, 
        level, 
        referrer_id
      ) VALUES (
        new_profile_id, 
        i, 
        current_referrer_id
      );
      
      -- Update referrer stats
      UPDATE public.profiles 
      SET 
        total_referrals = total_referrals + 1,
        updated_at = now()
      WHERE id = current_referrer_id;
      
      -- Get next level referrer
      SELECT referred_by INTO current_referrer_id 
      FROM public.profiles 
      WHERE id = current_referrer_id;
    END LOOP;
  END IF;
  
  RETURN new_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.referral_levels REPLICA IDENTITY FULL;