import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from '@/contexts/wallet-context';
import { TokenAmount } from '@/components/ui/token-amount';
import { ArrowRight, Wallet, Lock, AlertTriangle } from 'lucide-react';

interface LockTokensModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    amount: number;
    recipientAddress: string;
    recipientName: string;
    jobTitle: string;
    isLoading?: boolean;
}

export function LockTokensModal({
    isOpen,
    onClose,
    onConfirm,
    amount,
    recipientAddress,
    recipientName,
    jobTitle,
    isLoading
}: LockTokensModalProps) {
    const { user } = useWallet();
    const currentBalance = parseFloat(user?.balance || '0');
    const remainingBalance = currentBalance - amount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-amber-500" />
                        Lock SHM in Escrow
                    </DialogTitle>
                    <DialogDescription>
                        You are about to lock SHM in a smart contract for this job.
                        These funds will be held securely until you release them.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Job:</span>
                            <span className="font-medium text-slate-900">{jobTitle}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Freelancer:</span>
                            <div className="text-right">
                                <div className="font-medium text-slate-900">{recipientName}</div>
                                <div className="text-xs text-slate-400 font-mono">
                                    {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-sm text-slate-600">Lock Amount (SHM)</span>
                            <TokenAmount amount={amount} size="lg" status="locked" />
                        </div>
                        Broadway
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Wallet Impact</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-md">
                                <div className="text-xs text-slate-500 mb-1">Current Available</div>
                                <div className="font-medium">{currentBalance.toFixed(2)} SHM</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                <div className="text-xs text-blue-600 mb-1">After Lock</div>
                                <div className="font-bold text-blue-700">{remainingBalance.toFixed(2)} SHM</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-md flex gap-2 items-start text-xs text-amber-800 border border-amber-100">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>
                            SHM will be deducted from your wallet immediately but will remain yours in the contract until you approve the work.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isLoading} className="gap-2">
                        {isLoading ? "Processing..." : (
                            <>
                                <Lock className="w-4 h-4" />
                                Confirm & Lock SHM
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
