-- Fix function search path security warnings by setting search_path
CREATE OR REPLACE FUNCTION generate_referral_code(wallet_addr TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION handle_user_registration(
  p_user_id TEXT,
  p_wallet_address TEXT,
  p_twitter_username TEXT DEFAULT NULL,
  p_twitter_name TEXT DEFAULT NULL,
  p_profile_image_url TEXT DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;