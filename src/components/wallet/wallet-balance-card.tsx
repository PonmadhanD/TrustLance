'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, RefreshCw } from 'lucide-react';
import { useWallet } from '@/contexts/wallet-context';

export function WalletBalanceCard() {
    const { user, isConnected, refreshBalance } = useWallet();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshBalance();
        setLastUpdated(new Date());
        setTimeout(() => setIsRefreshing(false), 500);
    };

    useEffect(() => {
        if (isConnected) {
            handleRefresh();
        }
    }, [isConnected]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium">Blockchain Wallet Balance</p>
                        {isConnected && user?.balance ? (
                            <>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold mt-2">{user.balance} MATIC</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className="text-white hover:text-blue-100 hover:bg-blue-600/50"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                <p className="text-blue-100 text-sm mt-1">
                                    Last updated: Today, {formatTime(lastUpdated)}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-4xl font-bold mt-2">--</p>
                                <p className="text-blue-100 text-sm mt-1">
                                    {isConnected ? 'Fetching balance...' : 'Connect wallet to view balance'}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <Wallet className="h-16 w-16 text-blue-200 mb-4" />
                        {isConnected && (
                            <div className="text-sm text-blue-100">
                                <p>Network: Polygon</p>
                                <p className="text-xs mt-1">Amoy Testnet</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
