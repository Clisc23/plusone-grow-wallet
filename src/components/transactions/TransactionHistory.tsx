import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Gift, Users } from "lucide-react";
import { Transaction } from "@/services/profileService";

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

export const TransactionHistory = ({ transactions = [] }: TransactionHistoryProps) => {
  const getTransactionIcon = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-4 h-4" />;
      case 'receive': return <ArrowDownLeft className="w-4 h-4" />;
      case 'referral_bonus': return <Users className="w-4 h-4" />;
      case 'welcome_bonus': return <Gift className="w-4 h-4" />;
      default: return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'send': return 'text-destructive';
      case 'receive': return 'text-success';
      case 'referral_bonus': return 'text-primary';
      case 'welcome_bonus': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const formatTransactionType = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'send': return 'Sent';
      case 'receive': return 'Received';
      case 'referral_bonus': return 'Referral Bonus';
      case 'welcome_bonus': return 'Welcome Bonus';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="mx-6 mt-6 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your welcome bonus and referral rewards will appear here!
            </p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center ${getTransactionColor(transaction.transaction_type)}`}>
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{formatTransactionType(transaction.transaction_type)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                  {transaction.transaction_type === 'send' ? '-' : '+'}
                  {Number(transaction.amount).toFixed(2)} SOL
                </p>
                <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};