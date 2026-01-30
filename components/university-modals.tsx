"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lock, AlertTriangle } from "lucide-react";

interface LockUniversityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    universityName: string;
    onConfirm: () => void | Promise<void>;
}

export function LockUniversityModal({
    open,
    onOpenChange,
    universityName,
    onConfirm,
}: LockUniversityModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to lock university:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <AlertDialogTitle>Lock {universityName}?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="space-y-3">
                        <p>
                            By locking this university, you're committing to this as one of your target universities.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                            <p className="font-medium text-blue-900">What happens next:</p>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>✓ **Application Guidance** will unlock</li>
                                <li>✓ AI will generate university-specific tasks</li>
                                <li>✓ Your strategy becomes more focused</li>
                            </ul>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You can unlock later if needed, but it may reset some progress.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? "Locking..." : "Lock University"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface UnlockUniversityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    universityName: string;
    onConfirm: () => void | Promise<void>;
}

export function UnlockUniversityModal({
    open,
    onOpenChange,
    universityName,
    onConfirm,
}: UnlockUniversityModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to unlock university:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <AlertDialogTitle>Unlock {universityName}?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="space-y-3">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                            <p className="font-medium text-orange-900">⚠️ Warning:</p>
                            <ul className="text-sm text-orange-800 space-y-1">
                                <li>• University-specific tasks may be deleted</li>
                                <li>• Application guidance for this university will be removed</li>
                                <li>• Your preparation progress may be affected</li>
                            </ul>
                        </div>
                        <p className="font-medium">
                            Are you sure you want to unlock this university?
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {loading ? "Unlocking..." : "Yes, Unlock"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
