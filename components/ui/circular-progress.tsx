"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    size?: number;
    strokeWidth?: number;
    showValue?: boolean;
    label?: string;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
    ({ value, size = 120, strokeWidth = 8, showValue = true, label, className, ...props }, ref) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (value / 100) * circumference;

        return (
            <div
                ref={ref}
                className={cn("relative inline-flex items-center justify-center", className)}
                style={{ width: size, height: size }}
                {...props}
            >
                <svg
                    className="transform -rotate-90"
                    width={size}
                    height={size}
                >
                    {/* Background circle */}
                    <circle
                        className="text-muted/20"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    {/* Progress circle */}
                    <circle
                        className="text-primary transition-all duration-500 ease-in-out"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                </svg>
                {showValue && (
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{Math.round(value)}%</span>
                        {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
                    </div>
                )}
            </div>
        );
    }
);

CircularProgress.displayName = "CircularProgress";

export { CircularProgress };
