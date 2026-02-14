"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Minus,
    CreditCard,
    Building2,
    Smartphone,
    ArrowRight,
    ShieldCheck,
    IndianRupee
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FundManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "add" | "withdraw";
}

const paymentMethods = [
    { id: "upi", name: "UPI (PhonePe/GPay)", icon: <Smartphone className="h-5 w-5" /> },
    { id: "card", name: "Credit / Debit Card", icon: <CreditCard className="h-5 w-5" /> },
    { id: "netbanking", name: "Net Banking", icon: <Building2 className="h-5 w-5" /> },
];

export function FundManagementModal({ isOpen, onClose, type }: FundManagementModalProps) {
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("upi");

    const title = type === "add" ? "Add Funds" : "Withdraw Funds";
    const description = type === "add"
        ? "Top up your wallet instantly to pay for projects."
        : "Transfer your earnings to your bank account or wallet.";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white rounded-3xl">
                <div className={cn(
                    "p-8 text-white",
                    type === "add" ? "bg-blue-600" : "bg-slate-900"
                )}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-white">
                            {type === "add" ? <Plus className="h-6 w-6" /> : <Minus className="h-6 w-6" />}
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/80 mt-2">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-8 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                            <IndianRupee className="h-6 w-6" />
                        </div>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-white/10 border-white/20 text-white text-3xl font-bold h-16 pl-12 placeholder:text-white/30 focus-visible:ring-white/20 rounded-2xl"
                        />
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-slate-500 font-medium tracking-wide text-xs uppercase">Select Payment Method</Label>
                        <div className="grid gap-3">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                                        selectedMethod === method.id
                                            ? "border-blue-500 bg-blue-50/50"
                                            : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2 rounded-xl",
                                            selectedMethod === method.id ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {method.icon}
                                        </div>
                                        <span className="font-semibold text-slate-800">{method.name}</span>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "w-full h-14 rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95",
                            type === "add" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-slate-900 hover:bg-slate-800"
                        )}
                        onClick={() => {
                            // In a real app, this would trigger the payment process
                            alert(`${type === 'add' ? 'Adding' : 'Withdrawing'} ₹${amount} via ${selectedMethod}`);
                            onClose();
                        }}
                    >
                        {type === "add" ? "Confirm Payment" : "Withdraw Earnings"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        SECURE 256-BIT ENCRYPTED TRANSACTION
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
