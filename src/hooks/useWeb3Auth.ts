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
      setIsLoading(true);
      try {
        console.log("Initializing Web3Auth service...");
        const success = await web3AuthService.init();
        setIsInitialized(success);
        
        if (success) {
          console.log("Checking if already connected...");
          // Check if already connected
          if (web3AuthService.isConnected()) {
            setIsAuthenticated(true);
            console.log("User already connected");
          }
        } else {
          toast({
            title: "Initialization Failed",
            description: "Please refresh the page and try again",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize Web3Auth service",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [toast]);

  const login = async () => {
    if (!isInitialized) {
      toast({
        title: "Not Ready",
        description: "Please wait for initialization to complete",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Starting login...");
      const result = await web3AuthService.login();
      
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        setWallet(result.wallet);
        
        console.log("Login successful:", result);
        
        toast({
          title: "Welcome to PlusOne! 🎉",
          description: "You've successfully connected your wallet on Linea!",
        });
      } else {
        console.error("Login failed:", result.error);
        toast({
          title: "Login Failed",
          description: result.error || "Failed to authenticate with Web3Auth",
          variant: "destructive",
        });
      }
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

  const logout = async () => {
    setIsLoading(true);
    try {
      const result = await web3AuthService.logout();
      
      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
        setWallet(null);
        
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out",
        });
      } else {
        toast({
          title: "Logout Error",
          description: result.error || "Failed to logout properly",
          variant: "destructive",
        });
      }
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

  const getBalance = async (): Promise<string> => {
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