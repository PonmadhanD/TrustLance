'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, RefreshCw } from 'lucide-react';
import { useWallet } from '@/contexts/wallet-context';
import { CONFIG } from '@/lib/config';

export function WalletBalanceCard() {
    const { user, isConnected, isSyncing, networkError, currentChainId, refreshBalance, switchNetwork } = useWallet();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const isWrongNetwork = isConnected && currentChainId && currentChainId !== CONFIG.NETWORK_ID;

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
                        {isConnected && (user?.balance || isSyncing) ? (
                            <>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold mt-2">
                                        {isSyncing ? '...' : (user?.balance || '0.0000')} SHM
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing || isSyncing}
                                        className="text-white hover:text-blue-100 hover:bg-blue-600/50"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${(isRefreshing || isSyncing) ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                {networkError ? (
                                    <p className="text-red-200 text-xs mt-1 font-medium">{networkError}</p>
                                ) : (
                                    <p className="text-blue-100 text-sm mt-1">
                                        {isSyncing ? 'Syncing with Shardeum...' : `Last updated: Today, ${formatTime(lastUpdated)}`}
                                    </p>
                                )}
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
                    <div className="text-right flex flex-col items-end">
                        <Wallet className="h-10 w-10 text-blue-200 mb-2" />
                        {isConnected && (
                            <div className="text-sm text-blue-100">
                                <p className="font-bold">Network: {CONFIG.NETWORK_NAME}</p>
                                {isWrongNetwork && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="mt-2 h-8 text-xs bg-red-500 hover:bg-red-600 border-none animate-pulse"
                                        onClick={switchNetwork}
                                    >
                                        Switch to Shardeum
                                    </Button>
                                )}
                                <p className="text-xs mt-1">Chain ID: {currentChainId || '...'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
 