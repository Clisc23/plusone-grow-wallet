import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Users, TrendingUp, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralCardProps {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  currentLevel: number;
}

export const ReferralCard = ({
  referralCode = "ABC123",
  totalReferrals = 0,
  totalEarnings = 0,
  currentLevel = 1
}: ReferralCardProps) => {
  const { toast } = useToast();

  const handleShare = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join PlusOne Wallet',
        text: 'Get 10 free PlusOne tokens when you sign up!',
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Referral link copied!",
        description: "Share it with friends to earn rewards",
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Referral code copied!",
      description: referralCode,
    });
  };

  return (
    <Card className="mx-6 mt-4 bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Refer Friends & Earn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{totalEarnings}</p>
            <p className="text-xs text-muted-foreground">Tokens Earned</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">L{currentLevel}</p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Your Referral Code</p>
            <p className="font-mono font-semibold text-foreground">{referralCode}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyCode}
            className="text-primary hover:text-primary/80"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <Button 
          onClick={handleShare}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Referral Link
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Earn 10 tokens per referral + up to 5 levels of commissions!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};