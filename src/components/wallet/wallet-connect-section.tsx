'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Wallet,
    Shield,
    Copy,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    Link as LinkIcon
} from 'lucide-react';
import { useWallet } from '@/contexts/wallet-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export function WalletConnectSection() {
    const { user: authUser, linkWallet } = useAuth();
    const { user: walletUser, isConnected, connectWallet, disconnectWallet } = useWallet();
    const { toast } = useToast();
    const [isLinking, setIsLinking] = useState(false);

    const copyAddress = () => {
        if (walletUser?.walletAddress) {
            navigator.clipboard.writeText(walletUser.walletAddress);
            toast({
                title: "Copied!",
                description: "Wallet address copied to clipboard",
            });
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleLinkWallet = async () => {
        if (!walletUser?.walletAddress) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        setIsLinking(true);
        try {
            const result = await linkWallet(walletUser.walletAddress);

            if (result.success) {
                toast({
                    title: "Success!",
                    description: "Wallet linked to your account successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to link wallet",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to link wallet",
                variant: "destructive",
            });
        } finally {
            setIsLinking(false);
        }
    };

    const isWalletLinked = authUser?.wallet_address && authUser.wallet_address.toLowerCase() === walletUser?.walletAddress?.toLowerCase();

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Blockchain Wallet
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isConnected ? (
                    <div className="text-center py-8">
                        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                            Connect your MetaMask wallet to enable blockchain escrow payments and secure transactions
                        </p>
                        <Button
                            onClick={connectWallet}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Wallet className="h-4 w-4 mr-2" />
                            Connect MetaMask
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Wallet Connected */}
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Wallet Connected (Shardeum SHM)</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-sm font-mono text-gray-700">
                                            {walletUser?.balance ? `${walletUser.balance} SHM` : 'Loading...'}
                                        </code>
                                        <span className="text-gray-400">|</span>
                                        <code className="text-xs text-gray-500">
                                            {formatAddress(walletUser?.walletAddress || '')}
                                        </code>
                                        <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => window.open(`https://explorer-sphinx.shardeum.org/account/${walletUser?.walletAddress}`, '_blank')}
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={disconnectWallet}
                            >
                                Disconnect
                            </Button>
                        </div>

                        {/* Link to Account */}
                        {authUser?.wallet_address ? (
                            <div className={`p-4 rounded-lg border ${isWalletLinked
                                ? 'bg-green-50 border-green-200'
                                : 'bg-yellow-50 border-yellow-200'
                                }`}>
                                <div className="flex items-start gap-3">
                                    {isWalletLinked ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">
                                            {isWalletLinked ? 'Wallet Linked to Account' : 'Different Wallet Connected'}
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            Account wallet: <code className="font-mono">{formatAddress(authUser.wallet_address)}</code>
                                        </p>
                                        {!isWalletLinked && (
                                            <p className="text-xs text-yellow-700 mt-2">
                                                ⚠️ The connected MetaMask wallet is different from your account's linked wallet.
                                                You cannot change your linked wallet for security reasons.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <LinkIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 mb-2">Link Wallet to Account</p>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Link this wallet to your TrustLance account to enable blockchain escrow payments.
                                            Once linked, this cannot be changed.
                                        </p>
                                        <Button
                                            onClick={handleLinkWallet}
                                            disabled={isLinking}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isLinking ? 'Linking...' : 'Link Wallet to Account'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shardeum Network Settings (Helpful for users) */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-blue-900 mb-2">Shardeum Network Settings</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-blue-600 font-medium">Network Name</p>
                                    <p className="text-blue-900 font-bold">Shardeum</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium">RPC URL</p>
                                    <p className="text-blue-900 font-bold">api.shardeum.org</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium">Chain ID</p>
                                    <p className="text-blue-900 font-bold">8118</p>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium">Currency Symbol</p>
                                    <p className="text-blue-900 font-bold">SHM</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
                                <div className="text-xs text-gray-700">
                                    <strong>Security:</strong> Your wallet address is immutable and cannot be changed once linked.
                                    This ensures secure and verifiable transactions on the blockchain.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
