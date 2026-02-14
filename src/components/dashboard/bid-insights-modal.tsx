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
    Zap,
    Target,
    Users,
    BarChart2,
    Clock,
    Trophy,
    Lightbulb,
    MousePointer2,
    Search,
    MessageSquare,
    DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BidInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BidInsightsModal({ isOpen, onClose }: BidInsightsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 bg-slate-50 border-none shadow-2xl">
                <div className="bg-blue-600 p-8 text-white sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-white/20 text-white border-none px-2 py-0 font-bold uppercase tracking-widest text-[10px]">PRO Intelligence</Badge>
                                </div>
                                <DialogTitle className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                                    <Target className="h-8 w-8 text-white" />
                                    Bid Insights
                                </DialogTitle>
                                <DialogDescription className="text-blue-100/80">
                                    Data-driven intelligence to dominate your market.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Bid Quality Score */}
                            <Card className="border-none shadow-sm overflow-hidden bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                        <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                                        Bid Quality Score
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                                        <div className="relative h-32 w-32 flex items-center justify-center">
                                            <svg className="h-full w-full transform -rotate-90">
                                                <circle cx="64" cy="64" r="58" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                                                <circle
                                                    cx="64" cy="64" r="58" stroke="#2563eb" strokeWidth="10" fill="transparent"
                                                    strokeDasharray={2 * Math.PI * 58}
                                                    strokeDashoffset={2 * Math.PI * 58 * (1 - 0.72)}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <span className="absolute text-4xl font-black text-slate-900">72</span>
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    <span>Relevance</span>
                                                    <span className="text-blue-600">85%</span>
                                                </div>
                                                <Progress value={85} className="h-2 bg-slate-100" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                                    <span>Pricing</span>
                                                    <span className="text-blue-600">64%</span>
                                                </div>
                                                <Progress value={64} className="h-2 bg-slate-100" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Competitive Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: "Avg. Competitor Bid", value: "₹45,000", icon: <BarChart2 className="h-5 w-5 text-purple-600" />, desc: "12% more than you" },
                                    { title: "Response Speed", value: "14m", icon: <Clock className="h-5 w-5 text-emerald-600" />, desc: "Top 5% speed" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {stat.icon}
                                            {stat.title}
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                                        <p className="text-xs text-slate-500 font-medium">{stat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                                <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                                    <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                                        <Trophy className="h-4 w-4 text-amber-500" />
                                        Winning Trends
                                    </h3>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    {[
                                        { project: "E-Commerce App", value: "₹2.4L" },
                                        { project: "SaaS Dashboard", value: "₹1.8L" }
                                    ].map((win, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-none">
                                            <div className="text-xs font-bold text-slate-300">{win.project}</div>
                                            <div className="text-sm font-black text-emerald-400">{win.value}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-3">
                                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-widest">
                                    <Lightbulb className="h-4 w-4" />
                                    Smart Tip
                                </div>
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    Freelancers who include a <strong>video pitch</strong> in React projects have a 3.5x higher hire rate this month.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
