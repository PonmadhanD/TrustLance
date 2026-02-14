"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const plans = [
    {
        name: "Free",
        price: "₹0",
        description: "Perfect for getting started",
        features: [
            "6 Bids per month",
            "Standard support",
            "Basic profile visibility",
        ],
        icon: <Star className="h-6 w-6 text-slate-400" />,
        buttonText: "Current Plan",
        current: true,
    },
    {
        name: "Silver",
        price: "₹999",
        description: "Great for active freelancers",
        features: [
            "50 Bids per month",
            "Priority support",
            "Enhanced profile visibility",
            "Lower project fees (15%)",
            "Custom bid insights",
        ],
        icon: <Zap className="h-6 w-6 text-blue-500" />,
        buttonText: "Upgrade to Silver",
        recommended: true,
    },
    {
        name: "Gold",
        price: "₹4,999",
        description: "For the professional elite",
        features: [
            "Unlimited Bids",
            "24/7 Dedicated account manager",
            "Featured profile in searches",
            "Lowest project fees (10%)",
            "Exclusive webinar access",
            "Advanced analytics",
        ],
        icon: <Crown className="h-6 w-6 text-yellow-500" />,
        buttonText: "Upgrade to Gold",
    },
];

export function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="bg-slate-900 p-8 text-center text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-center text-white mb-2">
                            Choose Your Membership Plan
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-center text-lg">
                            Unlock exclusive features and grow your freelance business with our premium plans.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="grid md:grid-cols-3 gap-6 p-8 bg-slate-50">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-6 rounded-2xl bg-white border transition-all duration-300 hover:shadow-xl ${plan.recommended
                                    ? "border-blue-500 shadow-blue-100 shadow-lg scale-105 z-10"
                                    : "border-slate-200"
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-blue-600 text-white px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <div className="mb-4">{plan.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                                <span className="text-slate-500 text-sm"> / month</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-6 min-h-[40px]">{plan.description}</p>

                            <div className="flex-grow space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="mt-1 bg-green-100 rounded-full p-0.5">
                                            <Check className="h-3 w-3 text-green-600" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.current ? "outline" : "default"}
                                className={`w-full rounded-xl h-12 font-semibold transition-all ${plan.recommended
                                        ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
                                        : plan.current
                                            ? "text-slate-400 border-slate-200"
                                            : "bg-slate-900 hover:bg-slate-800"
                                    }`}
                                disabled={plan.current}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t text-center text-[11px] text-slate-400">
                    All memberships are billed monthly. Prices inclusive of all taxes.
                </div>
            </DialogContent>
        </Dialog>
    );
}
