import { useState, useEffect } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useToast } from "@/hooks/use-toast";
import { profileService, Profile } from "@/services/profileService";

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  verifierId?: string;
  twitterUsername?: string;
}

interface Wallet {
  address: string;
  publicKey: PublicKey | null;
  balance: number;
}

// Solana connection to devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const usePrivyAuth = () => {
  console.log("usePrivyAuth hook called");
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [dbProfile, setDbProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Get Solana wallet
  const solanaWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

  useEffect(() => {
    if (authenticated && user && solanaWallet) {
      // Set user profile from Twitter data
      const twitterAccount = user.twitter;
      setUserProfile({
        email: user.email?.address,
        name: twitterAccount?.name || user.email?.address?.split('@')[0],
        profileImage: twitterAccount?.profilePictureUrl,
        verifierId: twitterAccount?.username || user.email?.address?.split('@')[0] || 'User',
        twitterUsername: twitterAccount?.username,
      });

      // Set wallet info
      if (solanaWallet.address) {
        const publicKey = new PublicKey(solanaWallet.address);
        setWallet({
          address: solanaWallet.address,
          publicKey,
          balance: 0,
        });

        // Get wallet balance
        getBalance(publicKey);
        
        // Create or get database profile
        createOrGetProfile(user, solanaWallet.address, twitterAccount);
      }
    } else {
      setUserProfile(null);
      setWallet(null);
      setDbProfile(null);
    }
  }, [authenticated, user, solanaWallet]);

  const createOrGetProfile = async (user: any, walletAddress: string, twitterAccount: any) => {
    try {
      const profile = await profileService.upsertProfile({
        user_id: user.id,
        wallet_address: walletAddress,
        twitter_username: twitterAccount?.username,
        twitter_name: twitterAccount?.name,
        profile_image_url: twitterAccount?.profilePictureUrl,
      });
      
      setDbProfile(profile);
    } catch (error) {
      console.error("Failed to create/get profile:", error);
      toast({
        title: "Profile Error",
        description: "Failed to sync your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBalance = async (publicKey: PublicKey) => {
    try {
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      setWallet(prev => prev ? { ...prev, balance: solBalance } : null);
    } catch (error) {
      console.error("Failed to get balance:", error);
    }
  };

  const handleLogin = async () => {
    if (!ready) {
      toast({
        title: "Not Ready",
        description: "Please wait for initialization to complete",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login();
      
      toast({
        title: "Welcome to PlusOne! 🎉",
        description: "You've successfully connected with Twitter and created your Solana wallet!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async (to: string, amount: number) => {
    if (!authenticated || !wallet?.publicKey) {
      throw new Error("Not authenticated or wallet not available");
    }

    try {
      // This would be implemented with actual Solana transaction logic
      // For now, return a mock successful transaction
      return { 
        success: true, 
        txHash: "mock_transaction_hash",
        message: "Transaction functionality coming soon!"
      };
    } catch (error: any) {
      console.error("Transaction failed:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    isInitialized: ready,
    isAuthenticated: authenticated,
    user: userProfile,
    wallet,
    dbProfile,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    getBalance: () => dbProfile?.balance?.toString() || wallet?.balance?.toString() || "0",
    sendTransaction,
  };
};