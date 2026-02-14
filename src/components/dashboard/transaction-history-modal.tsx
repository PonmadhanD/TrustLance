"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Search,
    Filter,
    Download,
    Calendar,
    History,
    MoreVertical,
    CheckCircle2,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TransactionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const transactions = [
    {
        id: "TXN-849201",
        date: "22 Jan 2024, 02:30 PM",
        type: "Payout",
        amount: "- ₹45,000.00",
        status: "Completed",
        description: "Withdrawal to HDFC Bank ****1234",
        method: "Bank Transfer"
    },
    {
        id: "TXN-849195",
        date: "20 Jan 2024, 11:15 AM",
        type: "Escrow Release",
        amount: "+ ₹52,000.00",
        status: "Completed",
        description: "Payment for 'Full Stack E-commerce Application'",
        method: "Escrow"
    },
    {
        id: "TXN-849182",
        date: "18 Jan 2024, 05:45 PM",
        type: "Service Fee",
        amount: "- ₹5,200.00",
        status: "Completed",
        description: "Platform commission (10%) for project TNX-849195",
        method: "System"
    },
    {
        id: "TXN-849170",
        date: "15 Jan 2024, 09:00 AM",
        type: "Add Funds",
        amount: "+ ₹10,000.00",
        status: "Pending",
        description: "Deposit via UPI (PhonePe)",
        method: "UPI"
    }
];

export function TransactionHistoryModal({ isOpen, onClose }: TransactionHistoryModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 bg-slate-50 border-none shadow-2xl">
                <div className="bg-slate-900 p-8 text-white sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                                    <History className="h-8 w-8 text-blue-400" />
                                    Transaction History
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Detailed audit of all account movemements.
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2">
                                    <Download className="h-4 w-4" />
                                    Download CSV
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search records..." className="pl-10 h-10 bg-slate-50 border-none rounded-xl text-sm" />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs font-bold uppercase tracking-widest px-4">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                Date
                            </Button>
                            <Button variant="outline" className="h-10 rounded-xl gap-2 text-xs font-bold uppercase tracking-widest px-4">
                                <Filter className="h-4 w-4 text-slate-500" />
                                Filter
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden bg-white">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[9px] h-10">Date & ID</TableHead>
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[9px] h-10">Details</TableHead>
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[9px] h-10">Status</TableHead>
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[9px] h-10 text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((txn) => (
                                    <TableRow key={txn.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="font-bold text-slate-900 text-xs">{txn.date}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{txn.id}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="text-xs font-black text-slate-700">{txn.type}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{txn.description}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                {txn.status === "Completed" ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
                                                )}
                                                <span className={cn("font-black text-[10px] uppercase tracking-widest", txn.status === "Completed" ? "text-emerald-700" : "text-orange-700")}>
                                                    {txn.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <span className={cn("font-black text-xs tracking-tight", txn.amount.startsWith('+') ? "text-emerald-600" : "text-slate-900")}>
                                                {txn.amount}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
