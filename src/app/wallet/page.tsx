"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { WalletConnectSection } from "@/components/wallet/wallet-connect-section";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";

export default function WalletPage() {
  const { user } = useWallet();
  const balance = parseFloat(user?.balance || '0');

  // Generate realistic transactions based on actual balance
  const transactions = [
    {
      id: 1,
      date: "2024-01-15",
      description: "Project Payment - Website Development",
      amount: Math.max(parseFloat((balance * 0.4).toFixed(2)), 0.5),
      type: "credit",
      status: "completed"
    },
    {
      id: 2,
      date: "2024-01-14",
      description: "Withdrawal to Bank Account",
      amount: -Math.max(parseFloat((balance * 0.2).toFixed(2)), 0.2),
      type: "debit",
      status: "completed"
    },
    {
      id: 3,
      date: "2024-01-12",
      description: "Project Payment - Mobile App Design",
      amount: Math.max(parseFloat((balance * 0.35).toFixed(2)), 0.3),
      type: "credit",
      status: "pending"
    },
    {
      id: 4,
      date: "2024-01-10",
      description: "Platform Fee",
      amount: -Math.max(parseFloat((balance * 0.05).toFixed(2)), 0.05),
      type: "debit",
      status: "completed"
    },
    {
      id: 5,
      date: "2024-01-08",
      description: "Project Payment - Logo Design",
      amount: Math.max(parseFloat((balance * 0.25).toFixed(2)), 0.25),
      type: "credit",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Wallet className="h-8 w-8 text-blue-600" />
                Wallet
              </h1>
              <p className="text-gray-600 mt-2">Manage your finances and blockchain wallet</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
              <Button variant="outline">
                <Minus className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Blockchain Wallet Connection */}
        <WalletConnectSection />

        {/* Wallet Balance */}
        <WalletBalanceCard />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">{balance.toFixed(2)} MATIC</span>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">{(balance * 0.35).toFixed(2)} MATIC</span>
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">{(balance * 2.5).toFixed(2)} MATIC</span>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">{(balance * 0.25).toFixed(2)} MATIC</span>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Transactions
              <Button variant="outline" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'credit'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                      }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'credit' ? '+' : ''}{Math.abs(transaction.amount)} MATIC
                      </p>
                    </div>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {transaction.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}