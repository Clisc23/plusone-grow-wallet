import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { WalletHeader } from "@/components/wallet/WalletHeader";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { 
    isAuthenticated, 
    user, 
    wallet, 
    isLoading, 
    login, 
    logout 
  } = useWeb3Auth();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState({
    balance: 10, // Welcome bonus
    referralCode: "PLUS123",
    totalReferrals: 0,
    totalEarnings: 0,
    currentLevel: 1
  });

  // Generate referral code based on wallet address
  useEffect(() => {
    if (wallet?.address) {
      const code = wallet.address.slice(-6).toUpperCase();
      setUserProfile(prev => ({ ...prev, referralCode: code }));
    }
  }, [wallet]);

  const handleSend = () => {
    toast({
      title: "Send Tokens",
      description: "Send feature coming soon!",
    });
  };

  const handleReceive = () => {
    toast({
      title: "Receive Tokens",
      description: "Receive feature coming soon!",
    });
  };

  const handleAddFunds = () => {
    toast({
      title: "Add Funds",
      description: "Add funds feature coming soon!",
    });
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <WalletHeader 
        username={user?.verifierId || user?.name || "User"}
        profileImage={user?.profileImage}
        onSettings={logout}
      />
      
      <WalletBalance 
        balance={userProfile.balance}
        onSend={handleSend}
        onReceive={handleReceive}
        onAddFunds={handleAddFunds}
      />
      
      <ReferralCard 
        referralCode={userProfile.referralCode}
        totalReferrals={userProfile.totalReferrals}
        totalEarnings={userProfile.totalEarnings}
        currentLevel={userProfile.currentLevel}
      />
      
      <TransactionHistory />
      
      <div className="pb-6" /> {/* Bottom spacing */}
      
      {wallet && (
        <div className="fixed bottom-4 left-4 right-4 p-2 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Wallet: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
