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
    Wallet,
    ArrowUpRight,
    PieChart,
    DollarSign,
    ShieldCheck,
    Clock,
    RefreshCw,
    Info,
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

interface FinancialDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const financialData = [
    { name: "Week 1", amount: 45000 },
    { name: "Week 2", amount: 52000 },
    { name: "Week 3", amount: 48000 },
    { name: "Week 4", amount: 61000 },
];

export function FinancialDashboardModal({ isOpen, onClose }: FinancialDashboardModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto p-0 bg-slate-50 border-none shadow-2xl">
                <div className="bg-emerald-600 p-8 text-white sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                                    <PieChart className="h-8 w-8 text-white" />
                                    Financial Dashboard
                                </DialogTitle>
                                <DialogDescription className="text-emerald-100/80">
                                    Manage your earnings, escrow, and withdrawals.
                                </DialogDescription>
                            </div>
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2 h-10 rounded-xl font-bold">
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Wallet className="h-20 w-20" />
                            </div>
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    AVAILABLE BALANCE
                                </div>
                                <div className="text-4xl font-black italic tracking-tighter mb-6 flex items-baseline gap-1">
                                    <span className="text-2xl text-slate-500 font-bold italic">₹</span>
                                    1,42,500
                                </div>
                                <div className="flex gap-3">
                                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase h-10 rounded-xl">Withdraw</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                                        Held In Escrow
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-4 flex items-baseline gap-1">
                                    <span className="text-xl text-slate-300 font-bold">₹</span>
                                    87,200
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>Milestones</span>
                                        <span className="text-slate-900">4 Active</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>Next Payout</span>
                                        <span className="text-blue-600">24 Jan</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Clock className="h-3 w-3 text-orange-600" />
                                    Processing
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-2 flex items-baseline gap-1">
                                    <span className="text-xl text-slate-300 font-bold">₹</span>
                                    12,500
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-6">
                                    <div className="h-full bg-orange-500 w-[60%]" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-50 pb-6">
                                <CardTitle className="text-lg font-bold">Total Earnings Progression</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] p-0 pt-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAmountModal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmountModal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Snippet</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { type: "Release", amount: "+ ₹45k", color: "text-emerald-600" },
                                        { type: "Fee", amount: "- ₹4.5k", color: "text-slate-900" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-none">
                                            <div className="text-xs font-bold text-slate-700">{item.type}</div>
                                            <div className={cn("text-xs font-black", item.color)}>{item.amount}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <TrendingUp className="h-16 w-16" />
                                </div>
                                <h4 className="font-bold text-lg mb-1">Growth Report</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">+34% Growth this quarter</p>
                                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold h-10 rounded-xl text-xs uppercase">Full Report</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
