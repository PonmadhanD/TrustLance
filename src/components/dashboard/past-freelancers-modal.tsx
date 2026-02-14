"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Users,
    MessageSquare,
    Briefcase,
    Star,
    Clock,
    Zap,
    CheckCircle2,
    ExternalLink,
    ChevronRight,
    UserPlus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PastFreelancersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const pastFreelancers = [
    {
        id: "f1",
        name: "Alex Thompson",
        role: "Full Stack Developer",
        lastProject: "E-Commerce Mobile App",
        rating: 5.0,
        onlineStatus: "online", // Last 24h
        lastActive: "Active 2h ago",
        matchScore: 98,
        avatar: "/api/placeholder/40/40"
    },
    {
        id: "f2",
        name: "Sarah Chen",
        role: "UI/UX Designer",
        lastProject: "Saas Dashboard Redesign",
        rating: 4.9,
        onlineStatus: "away", // > 24h
        lastActive: "Active 3 days ago",
        matchScore: 94,
        avatar: "/api/placeholder/40/40"
    },
    {
        id: "f3",
        name: "Michael Rodriguez",
        role: "React Specialist",
        lastProject: "Internal HR Portal",
        rating: 5.0,
        onlineStatus: "online",
        lastActive: "Active now",
        matchScore: 100,
        avatar: "/api/placeholder/40/40"
    }
];

export function PastFreelancersModal({ isOpen, onClose }: PastFreelancersModalProps) {
    const { toast } = useToast();
    const [hiring, setHiring] = useState<string | null>(null);

    const handleHireAgain = (name: string, id: string) => {
        setHiring(id);
        // Mocking notification logic
        setTimeout(() => {
            setHiring(null);
            toast({
                title: "Re-hire request sent!",
                description: `${name} has been notified and invited to view your new project.`,
                duration: 3000,
            });
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 bg-white border-none shadow-2xl rounded-[32px]">
                {/* Header Section */}
                <div className="bg-slate-900 p-8 text-white sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white leading-tight">
                                    My Network
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    Re-hire your top performing partners
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Past Collaborators</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">View All</span>
                    </div>

                    <div className="space-y-3">
                        {pastFreelancers.map((freelancer) => (
                            <div
                                key={freelancer.id}
                                className="group p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar with Status Light */}
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                            <AvatarImage src={freelancer.avatar} />
                                            <AvatarFallback className="font-bold">{freelancer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className={cn(
                                            "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                                            freelancer.onlineStatus === 'online' ? "bg-emerald-500" : "bg-rose-500"
                                        )} />
                                    </div>

                                    {/* Profile Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="font-black text-slate-900 truncate">{freelancer.name}</h4>
                                            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100">
                                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                <span className="text-[10px] font-black text-amber-700">{freelancer.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 mb-2">{freelancer.role}</p>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                                                <Briefcase className="h-3 w-3" />
                                                {freelancer.lastProject}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                {freelancer.lastActive}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions & Insights */}
                                    <div className="text-right space-y-2">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100 mb-1">
                                                <Zap className="h-3 w-3 text-blue-600 fill-blue-600" />
                                                <span className="text-[10px] font-black text-blue-700">{freelancer.matchScore}% Match</span>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Better Solution Score</span>
                                        </div>

                                        <Button
                                            size="sm"
                                            onClick={() => handleHireAgain(freelancer.name, freelancer.id)}
                                            disabled={hiring === freelancer.id}
                                            className={cn(
                                                "rounded-xl h-9 px-4 font-black text-xs uppercase transition-all",
                                                hiring === freelancer.id ? "bg-slate-200 text-slate-400" : "bg-slate-900 hover:bg-blue-600 text-white shadow-lg shadow-slate-200 hover:shadow-blue-200"
                                            )}
                                        >
                                            {hiring === freelancer.id ? "Notifying..." : (
                                                <>
                                                    <UserPlus className="h-3 w-3 mr-2" />
                                                    Hire Again
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                        <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                            <h5 className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">Verified Partners</h5>
                            <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                                Re-hiring past partners reduces project risk by 40% and speeds up onboarding.
                                These freelancers have already proven their value on your previous projects.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 text-center border-t border-slate-50">
                    <Button variant="ghost" className="text-slate-400 font-bold text-xs hover:text-slate-600" onClick={onClose}>
                        Close Window
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
