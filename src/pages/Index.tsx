import { useState } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { WalletHeader } from "@/components/wallet/WalletHeader";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: "cryptofan2024",
    profileImage: undefined,
    balance: 10, // Welcome bonus
    referralCode: "PLUS123",
    totalReferrals: 0,
    totalEarnings: 0,
    currentLevel: 1
  });

  const handleLogin = () => {
    // TODO: Integrate Web3Auth Twitter login
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <WalletHeader 
        username={userProfile.username}
        profileImage={userProfile.profileImage}
      />
      
      <WalletBalance 
        balance={userProfile.balance}
      />
      
      <ReferralCard 
        referralCode={userProfile.referralCode}
        totalReferrals={userProfile.totalReferrals}
        totalEarnings={userProfile.totalEarnings}
        currentLevel={userProfile.currentLevel}
      />
      
      <TransactionHistory />
      
      <div className="pb-6" /> {/* Bottom spacing */}
    </div>
  );
};

export default Index;
