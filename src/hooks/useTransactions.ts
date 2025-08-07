import { useState, useEffect } from "react";
import { usePrivyAuth } from "./usePrivyAuth";
import { transactionService, Transaction } from "@/services/profileService";

export const useTransactions = () => {
  const { dbProfile } = usePrivyAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dbProfile?.id) {
      fetchTransactions();
    }
  }, [dbProfile?.id]);

  const fetchTransactions = async () => {
    if (!dbProfile?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await transactionService.getUserTransactions(dbProfile.id);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (transaction: {
    from_profile_id?: string;
    to_profile_id?: string;
    amount: number;
    transaction_type: Transaction['transaction_type'];
    tx_hash?: string;
    status?: Transaction['status'];
  }) => {
    try {
      const newTransaction = await transactionService.createTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error("Failed to create transaction:", err);
      throw err;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    createTransaction,
  };
};