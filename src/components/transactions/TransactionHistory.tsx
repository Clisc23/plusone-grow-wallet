import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Users, Gift } from "lucide-react";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'referral' | 'bonus';
  amount: number;
  from?: string;
  to?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

export const TransactionHistory = ({ transactions = [] }: TransactionHistoryProps) => {
  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'referral':
        return <Users className="w-4 h-4 text-primary" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const sign = type === 'send' ? '-' : '+';
    return `${sign}${amount}`;
  };

  // Mock data if no transactions provided
  const mockTransactions: Transaction[] = transactions.length > 0 ? transactions : [
    {
      id: '1',
      type: 'bonus',
      amount: 10,
      timestamp: new Date(),
      status: 'completed'
    }
  ];

  return (
    <Card className="mx-6 mt-4 bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start referring friends to see activity here!
            </p>
          </div>
        ) : (
          mockTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {getIcon(transaction.type)}
                <div>
                  <p className="font-medium text-foreground capitalize">
                    {transaction.type === 'bonus' ? 'Sign-up Bonus' : transaction.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'send' ? 'text-destructive' : 'text-success'
                }`}>
                  {formatAmount(transaction.amount, transaction.type)} PO
                </p>
                <Badge className={getStatusColor(transaction.status)}>
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