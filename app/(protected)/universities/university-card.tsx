"use client";

import { University } from "@/lib/universities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, DollarSign, GraduationCap, MapPin, TrendingUp, Lock, Unlock, Loader2, Heart } from "lucide-react";
import { lockUniversity, unlockUniversity } from "@/app/actions/universities";
import { LockUniversityModal, UnlockUniversityModal } from "@/components/university-modals";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// Actually, I'll use simple window.alert or console if toast isn't set up, but I'll try to find a toast component later. 
// For now, I'll stick to basic state feedback.

interface UniversityCardProps {
    university: University;
    isLocked: boolean;
    hasAnyLock: boolean;
    isShortlisted: boolean;
    onToggleShortlist: () => void;
}

export function UniversityCard({ university, isLocked, hasAnyLock, isShortlisted, onToggleShortlist }: UniversityCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const router = useRouter();

    const categoryColors = {
        dream: "border-primary/20 bg-primary/5",
        target: "border-blue-500/20 bg-blue-500/5",
        safe: "border-muted-foreground/20 bg-muted/30"
    };

    const categoryBadge = {
        dream: "bg-primary/10 text-primary border-primary/20",
        target: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        safe: "bg-muted text-muted-foreground border-border"
    };

    const handleLockConfirm = async () => {
        setIsLoading(true);
        try {
            await lockUniversity(university.id);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to lock university");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlockConfirm = async () => {
        setIsLoading(true);
        try {
            await unlockUniversity(university.id);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to unlock university");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card className={`${categoryColors[university.category]} border ${isLocked ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg line-clamp-2">{university.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1.5 mt-1">
                                <MapPin className="h-3 w-3" />
                                {university.location}, {university.country}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={categoryBadge[university.category]}>
                                #{university.ranking}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={onToggleShortlist}
                            >
                                <Heart className={`h-4 w-4 ${isShortlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">
                                {university.tuitionPerYear === 0
                                    ? "Free"
                                    : `$${(university.tuitionPerYear / 1000).toFixed(0)}k/yr`}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{university.acceptanceRate}% accept</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{university.whyItFits}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{university.risks}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {university.programs.slice(0, 2).map(program => (
                            <Badge key={program} variant="secondary" className="text-xs">
                                {program}
                            </Badge>
                        ))}
                        {university.programs.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{university.programs.length - 2}
                            </Badge>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="pt-3 border-t">
                    <Button
                        variant={isLocked ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => isLocked ? setShowUnlockModal(true) : setShowLockModal(true)}
                        disabled={isLoading || (!isLocked && hasAnyLock)}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Lock className="mr-2 h-4 w-4" />
                                {isLocked ? "Locked" : hasAnyLock ? "Another University Locked" : "Lock University"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <LockUniversityModal
                open={showLockModal}
                onOpenChange={setShowLockModal}
                universityName={university.name}
                onConfirm={handleLockConfirm}
            />

            <UnlockUniversityModal
                open={showUnlockModal}
                onOpenChange={setShowUnlockModal}
                universityName={university.name}
                onConfirm={handleUnlockConfirm}
            />
        </>
    );
}
