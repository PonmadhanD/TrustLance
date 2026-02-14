"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    ChevronDown,
    ExternalLink,
    LogOut,
    Copy,
    Check,
    Lock,
    Coins
} from "lucide-react";
import { CONFIG } from "@/lib/config";
import { TokenAmount } from "@/components/ui/token-amount";

export function WalletWidget() {
    const { user, isConnected, connectWallet, disconnectWallet, refreshBalance } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopy = () => {
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected || !user) {
        return (
            <Button
                onClick={() => connectWallet()}
                variant="outline"
                className="bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white gap-2"
            >
                <Wallet className="h-4 w-4" />
                Connect Wallet
            </Button>
        );
    }

    const shortenedAddress = `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all duration-200 ${isOpen
                    ? "bg-slate-700 border-green-500/50"
                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                    }`}
            >
                <div className="flex flex-col items-end text-right mr-1">
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                        {user.walletAddress ? shortenedAddress : "Start Wallet"}
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                        {user.balance || "0.0"} SHM
                        {user.lockedBalance && parseFloat(user.lockedBalance) > 0 && (
                            <span className="text-amber-400 ml-1">
                                (+{user.lockedBalance} Locked)
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-slate-700 p-1.5 rounded-md">
                    {/* MetaMask Fox Icon or Generic Wallet */}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-4 z-50 text-slate-800">
                    <div className="px-5 pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Wallet Connected</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                {CONFIG.NETWORK_NAME}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <span className="font-mono text-xs text-slate-600 truncate flex-1">
                                {user.walletAddress}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                title="Copy Address"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            <a
                                href={`https://explorer-sphinx.shardeum.org/account/${user.walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                                title="View on Explorer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>

                    <div className="px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 flex items-center gap-1.5">
                                <Coins className="w-4 h-4" /> Available Balance
                            </span>
                            <span className="font-bold text-slate-800">{user.balance || "0.0"} SHM</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 flex items-center gap-1.5">
                                <Lock className="w-4 h-4 text-amber-500" /> Locked in Escrow
                            </span>
                            <span className="font-bold text-amber-600">{user.lockedBalance || "0.0"} SHM</span>
                        </div>

                        <div className="border-t border-slate-100 my-2 pt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Total Net Worth</span>
                            <span className="font-bold text-slate-900 text-lg">{user.totalBalance || user.balance || "0.0"} SHM</span>
                        </div>
                    </div>

                    <div className="px-2 pt-2 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                            onClick={disconnectWallet}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Disconnect Wallet
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
 