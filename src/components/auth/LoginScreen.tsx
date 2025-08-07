import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Wallet, Users, TrendingUp } from "lucide-react";

interface LoginScreenProps {
  onLogin?: () => void;
  isLoading?: boolean;
}

export const LoginScreen = ({ onLogin, isLoading = false }: LoginScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Hero */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">PlusOne</h1>
            <p className="text-muted-foreground">The Social Crypto Wallet</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Refer Friends</p>
              <p className="text-sm text-muted-foreground">Earn tokens for every referral</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Multi-Level Rewards</p>
              <p className="text-sm text-muted-foreground">Earn up to 5 levels deep</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold text-foreground">Get Started</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with Twitter to get your 10 free PlusOne tokens
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={onLogin}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <Twitter className="w-5 h-5 mr-2" />
              {isLoading ? "Connecting..." : "Continue with Twitter"}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bonus highlight */}
        <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-primary font-semibold">🎉 Welcome Bonus: 10 Free Tokens!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Plus earn more by referring friends
          </p>
        </div>
      </div>
    </div>
  );
};