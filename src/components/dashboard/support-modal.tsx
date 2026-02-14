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
    Mail,
    MessageSquare,
    Phone,
    Globe,
    ExternalLink,
    HelpCircle,
    BookOpen,
    ShieldCheck,
    ChevronRight,
    LifeBuoy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 bg-slate-50 border-none shadow-2xl">
                <div className="bg-slate-900 p-8 text-white sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <LifeBuoy className="h-8 w-8" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-bold text-white mb-1">
                                    Help Center
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Support, documentation, and expert assistance.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-12">
                    {/* Contact Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm text-center border border-slate-100 hover:border-blue-100 transition-colors cursor-pointer group">
                            <div className="mx-auto h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Mail className="h-6 w-6" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-1">Email</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">2h Response</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm text-center border border-slate-100 hover:border-emerald-100 transition-colors cursor-pointer group">
                            <div className="mx-auto h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-1">Live Chat</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Online Now</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm text-center border border-slate-100 hover:border-purple-100 transition-colors cursor-pointer group">
                            <div className="mx-auto h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Phone className="h-6 w-6" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-1">Phone</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Priority Line</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">Resources</h3>
                            <div className="space-y-2">
                                {[
                                    { title: "Documentation", icon: <BookOpen className="h-4 w-4" /> },
                                    { title: "Safety Guide", icon: <ShieldCheck className="h-4 w-4" /> },
                                    { title: "TrustLance Global", icon: <Globe className="h-4 w-4" /> }
                                ].map(link => (
                                    <button key={link.title} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-200/50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">
                                                {link.icon}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{link.title}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-lg font-black text-slate-900 border-l-4 border-emerald-600 pl-4 uppercase tracking-tighter">Common Questions</h3>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-slate-100">
                                    <AccordionTrigger className="text-sm font-bold text-slate-800 hover:no-underline hover:text-blue-600 text-left">
                                        How do I withdraw my earnings?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Earnings can be withdrawn once milestones are released by the client. Visit the Financial Dashboard and click 'Withdraw' to start the process.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-slate-100">
                                    <AccordionTrigger className="text-sm font-bold text-slate-800 hover:no-underline hover:text-blue-600 text-left">
                                        What are the platform fees?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Fees vary based on your membership tier (10% for Gold, 20% for Free). Check the Membership modal for full details.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
