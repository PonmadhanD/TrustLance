import React from 'react';
import { cn } from '@/lib/utils';
import { Coins, Lock, CheckCircle } from 'lucide-react';

interface TokenAmountProps {
    amount: number | string;
    status?: 'available' | 'locked' | 'earned' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
    iconClassName?: string;
}

export function TokenAmount({
    amount,
    status = 'neutral',
    size = 'md',
    showIcon = true,
    className,
    iconClassName
}: TokenAmountProps) {
    const formattedAmount = typeof amount === 'string' ? parseFloat(amount).toFixed(2) : amount.toFixed(2);

    const variants = {
        available: 'bg-blue-50 text-blue-700 border-blue-200',
        locked: 'bg-amber-50 text-amber-700 border-amber-200',
        earned: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        neutral: 'bg-slate-50 text-slate-700 border-slate-200'
    };

    const sizes = {
        sm: 'text-xs py-1 px-2',
        md: 'text-sm py-1.5 px-3',
        lg: 'text-base py-2 px-4 font-semibold'
    };

    const icons = {
        available: Coins,
        locked: Lock,
        earned: CheckCircle,
        neutral: Coins
    };

    const Icon = icons[status];

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 rounded-full border",
            variants[status],
            sizes[size],
            className
        )}>
            {showIcon && <Icon className={cn("w-4 h-4", iconClassName)} />}
            <span>{formattedAmount} SHM</span>
        </div>
    );
}
 