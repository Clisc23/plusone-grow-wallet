import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, QrCode, Plus } from "lucide-react";

interface WalletBalanceProps {
  balance: number;
  onSend?: () => void;
  onReceive?: () => void;
  onAddFunds?: () => void;
}

export const WalletBalance = ({ 
  balance = 0, 
  onSend, 
  onReceive, 
  onAddFunds 
}: WalletBalanceProps) => {
  return (
    <Card className="mx-6 mt-6 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
          <h2 className="text-4xl font-bold text-foreground mb-1">
            {balance.toLocaleString()}
          </h2>
          <p className="text-lg text-primary font-semibold">PlusOne Tokens</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={onSend}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button 
            onClick={onReceive}
            variant="outline"
            className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Receive
          </Button>
          <Button 
            onClick={onAddFunds}
            variant="outline"
            className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};