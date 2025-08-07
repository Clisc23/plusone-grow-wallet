import { useState, useEffect } from "react";
import { web3AuthService } from "@/lib/web3auth";
import { useToast } from "@/hooks/use-toast";

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  verifierId?: string;
}

interface Wallet {
  address: string;
  provider: any;
}

export const useWeb3Auth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const success = await web3AuthService.init();
        setIsInitialized(success);
        
        // Check if already connected
        if (web3AuthService.isConnected()) {
          setIsAuthenticated(true);
          // You might want to get user info here if needed
        }
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize authentication service",
          variant: "destructive",
        });
      }
    };

    init();
  }, [toast]);

  const login = async () => {
    if (!isInitialized) {
      toast({
        title: "Not Ready",
        description: "Authentication service is still initializing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await web3AuthService.login();
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        setWallet(result.wallet);
        
        toast({
          title: "Welcome to PlusOne! 🎉",
          description: "You've received 10 free PlusOne tokens!",
        });
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Failed to authenticate",
          variant: "destructive",
        });
      }
    } catch (error) {
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

  const logout = async () => {
    setIsLoading(true);
    try {
      await web3AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setWallet(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async () => {
    if (!wallet?.address) return "0";
    return await web3AuthService.getBalance(wallet.address);
  };

  const sendTransaction = async (to: string, amount: string) => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }
    return await web3AuthService.sendTransaction(to, amount);
  };

  return {
    isInitialized,
    isAuthenticated,
    user,
    wallet,
    isLoading,
    login,
    logout,
    getBalance,
    sendTransaction,
  };
};