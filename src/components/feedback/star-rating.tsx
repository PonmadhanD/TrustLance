// Star Rating Component
// Reusable component for displaying and inputting star ratings with half-star support

"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    max?: number;
    readOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}

export function StarRating({
    value,
    onChange,
    max = 5,
    readOnly = false,
    size = 'md',
    showValue = true,
    className
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const handleClick = (rating: number) => {
        if (!readOnly && onChange) {
            onChange(rating);
        }
    };

    const handleMouseEnter = (rating: number) => {
        if (!readOnly) {
            setHoverValue(rating);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverValue(null);
        }
    };

    const displayValue = hoverValue !== null ? hoverValue : value;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-0.5">
                {Array.from({ length: max }, (_, i) => {
                    const starValue = i + 1;
                    const isFilled = displayValue >= starValue;
                    const isHalfFilled = displayValue >= starValue - 0.5 && displayValue < starValue;

                    return (
                        <div
                            key={i}
                            className={cn(
                                "relative",
                                !readOnly && "cursor-pointer transition-transform hover:scale-110"
                            )}
                            onClick={() => handleClick(starValue)}
                            onMouseEnter={() => handleMouseEnter(starValue)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Background star (empty) */}
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    "text-gray-300"
                                )}
                            />

                            {/* Filled star overlay */}
                            {(isFilled || isHalfFilled) && (
                                <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{
                                        width: isHalfFilled ? '50%' : '100%'
                                    }}
                                >
                                    <Star
                                        className={cn(
                                            sizeClasses[size],
                                            "text-yellow-500 fill-yellow-500"
                                        )}
                                    />
                                </div>
                            )}

                            {/* Half star for 0.5 increments */}
                            {!readOnly && hoverValue === starValue - 0.5 && (
                                <div className="absolute inset-0 overflow-hidden w-1/2">
                                    <Star className={cn(sizeClasses[size], "text-yellow-400 fill-yellow-400")} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showValue && (
                <span className="text-sm font-medium text-gray-700">
                    {displayValue.toFixed(1)}/{max}
                </span>
            )}
        </div>
    );
}

// Simplified version for just displaying a rating (read-only)
interface StarDisplayProps {
    rating: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
}

export function StarDisplay({
    rating,
    max = 5,
    size = 'sm',
    showValue = true,
    className
}: StarDisplayProps) {
    return (
        <StarRating
            value={rating}
            max={max}
            size={size}
            showValue={showValue}
            readOnly
            className={className}
        />
    );
}
