import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TokenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    availableBalance?: string | number;
    showBalance?: boolean;
    error?: string;
    className?: string;
    helperText?: React.ReactNode;
}

export function TokenInput({
    label,
    value,
    onChange,
    availableBalance,
    showBalance = true,
    error,
    className,
    helperText,
    ...props
}: TokenInputProps) {
    const isInsufficient = availableBalance !== undefined && Number(value) > Number(availableBalance);

    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label>{label}</Label>}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Coins className="h-4 w-4" />
                </div>
                <Input
                    type="number"
                    value={value}
                    onChange={onChange}
                    className={cn(
                        "pl-9 pr-12",
                        error || isInsufficient ? "border-red-500 focus-visible:ring-red-500" : ""
                    )}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    {...props}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                    SHM
                </div>
            </div>

            <div className="flex justify-between text-xs">
                <div className="text-red-500 font-medium">
                    {(error || isInsufficient) && (
                        <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {error || "Insufficient balance"}
                        </span>
                    )}
                    {!error && !isInsufficient && helperText}
                </div>

                {showBalance && availableBalance !== undefined && (
                    <div className={cn(
                        "text-slate-500",
                        isInsufficient ? "text-red-500 font-medium" : ""
                    )}>
                        Available: {availableBalance} SHM
                    </div>
                )}
            </div>
        </div>
    );
}
 