import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { WalletHeader } from "@/components/wallet/WalletHeader";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  console.log("Index component rendering...");
  
  try {
    const { 
      isAuthenticated, 
      user, 
      wallet, 
      dbProfile,
      isLoading, 
      login, 
      logout 
    } = usePrivyAuth();
    const { transactions } = useTransactions();
    const { toast } = useToast();
    
    console.log("Auth state:", { isAuthenticated, user, wallet, isLoading });
  
  // Remove the hardcoded userProfile state since we're using real data from the database

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

    console.log("Rendering login screen");
    if (!isAuthenticated) {
      return <LoginScreen onLogin={login} isLoading={isLoading} />;
    }

    console.log("Rendering authenticated dashboard");
    return (
      <div className="min-h-screen bg-background">
        <WalletHeader 
          username={user?.verifierId || user?.name || "User"}
          profileImage={user?.profileImage}
          onSettings={logout}
        />
        
        <WalletBalance 
          balance={dbProfile?.balance || 0}
          onSend={handleSend}
          onReceive={handleReceive}
          onAddFunds={handleAddFunds}
        />
        
        <ReferralCard 
          referralCode={dbProfile?.referral_code || "LOADING..."}
          totalReferrals={dbProfile?.total_referrals || 0}
          totalEarnings={dbProfile?.total_earnings || 0}
          currentLevel={Math.min(Math.floor((dbProfile?.total_referrals || 0) / 5) + 1, 5)}
        />
        
        <TransactionHistory transactions={transactions} />
        
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
  } catch (error) {
    console.error("Error in Index component:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">PlusOne</h1>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }
};

export default Index;
