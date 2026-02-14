"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, ArrowRight, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/wallet-context";

export function WalletWidget() {
    const router = useRouter();
    const { user, isSyncing, refreshBalance } = useWallet();

    return (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center justify-between">
                    <span>Wallet Balance</span>
                    <div className="flex items-center gap-2">
                        {isSyncing && <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />}
                        <Wallet className="h-4 w-4 text-blue-400" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">
                                {user?.balance || (isSyncing ? "..." : "0.0000")}
                            </span>
                            <span className="text-xl font-medium text-slate-400">SHM</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Shardeum Sphinx
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-0 transition-all"
                            onClick={() => router.push('/wallet')}
                        >
                            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                            onClick={() => router.push('/wallet')}
                        >
                            <ArrowRight className="h-3.5 w-3.5 mr-2" />
                            Details
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
 