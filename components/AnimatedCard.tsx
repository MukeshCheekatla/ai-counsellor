"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends ComponentProps<typeof Card> {
    delay?: number;
}

export function AnimatedCard({ children, delay = 0, className, ...props }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
        >
            <Card className={cn(className)} {...props}>
                {children}
            </Card>
        </motion.div>
    );
}

// Export card components for convenience
export { CardContent, CardDescription, CardHeader, CardTitle };
