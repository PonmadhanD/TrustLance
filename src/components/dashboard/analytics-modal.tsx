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
    TrendingUp,
    Users,
    Target,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Download,
    PieChart as PieChartIcon,
    BarChart3,
    LineChart as LineChartIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const data = [
    { name: "Jan", earnings: 4000, projects: 4 },
    { name: "Feb", earnings: 3000, projects: 3 },
    { name: "Mar", earnings: 2000, projects: 2 },
    { name: "Apr", earnings: 2780, projects: 5 },
    { name: "May", earnings: 1890, projects: 3 },
    { name: "Jun", earnings: 2390, projects: 4 },
    { name: "Jul", earnings: 3490, projects: 6 },
];

const stats = [
    { title: "Total Earnings", value: "₹2,45,000", change: "+12.5%", trend: "up", icon: <DollarSign className="h-5 w-5 text-emerald-600" /> },
    { title: "Project Wins", value: "24", change: "+18%", trend: "up", icon: <Target className="h-5 w-5 text-blue-600" /> },
    { title: "Profile Views", value: "1,204", change: "-3.2%", trend: "down", icon: <Users className="h-5 w-5 text-purple-600" /> },
    { title: "Bid Success Rate", value: "68%", change: "+5.4%", trend: "up", icon: <TrendingUp className="h-5 w-5 text-orange-600" /> },
];

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 bg-slate-50 border-none shadow-2xl">
                <div className="bg-slate-900 p-8 text-white sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-3xl font-bold text-white mb-1">
                                    Account Analytics
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Real-time performance metrics and growth tracking.
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2">
                                    <Download className="h-4 w-4" />
                                    Export Report
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <Card key={stat.title} className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-slate-50 rounded-xl">
                                            {stat.icon}
                                        </div>
                                        <Badge variant={stat.trend === "up" ? "outline" : "destructive"} className={cn("gap-1 px-2 py-0 border-none", stat.trend === "up" && "bg-emerald-100 text-emerald-700")}>
                                            {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                            {stat.change}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.title}</p>
                                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-8">
                                <div>
                                    <CardTitle className="text-lg font-bold">Earnings Overview</CardTitle>
                                    <CardDescription>Monthly revenue growth tracker</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-50"><LineChartIcon className="h-4 w-4" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="earnings"
                                            stroke="#2563eb"
                                            strokeWidth={4}
                                            dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 8, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-slate-900 text-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white">Performance Score</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-6">
                                <div className="relative h-40 w-40 flex items-center justify-center">
                                    <svg className="h-full w-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="74" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                                        <circle
                                            cx="80" cy="80" r="74" stroke="#3b82f6" strokeWidth="10" fill="transparent"
                                            strokeDasharray={2 * Math.PI * 74}
                                            strokeDashoffset={2 * Math.PI * 74 * (1 - 0.85)}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-4xl font-black">85%</span>
                                </div>
                                <div className="w-full mt-8 space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                        <span>Satisfaction</span>
                                        <span className="text-white">4.9/5.0</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                        <span>On-time</span>
                                        <span className="text-white">98%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
