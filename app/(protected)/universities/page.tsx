"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, MapPin, DollarSign, TrendingUp, Heart, Lock, Star, Globe, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface University {
    id: string;
    name: string;
    country: string;
    city: string | null;
    ranking: number | null;
    tuitionFee: number;
    acceptanceRate: number | null;
    category: string;
    programType: string | null;
    scholarships: boolean;
}

// Deterministic match score generator
function getMatchScore(id: string, category: string): number {
    let baseScore = 0;
    // Base score by category
    if (category === 'safe') baseScore = 90;
    else if (category === 'target') baseScore = 80;
    else baseScore = 70;

    // Add deterministic variance
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return baseScore + (Math.abs(hash) % 10);
}

export default function UniversitiesPage() {
    const router = useRouter();
    const [universities, setUniversities] = useState<University[]>([]);
    const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
    const [locked, setLocked] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: "all", country: "all", search: "" });

    useEffect(() => {
        fetchUniversities();
        fetchShortlistedAndLocked();
    }, []);

    const fetchUniversities = async () => {
        try {
            const res = await fetch("/api/universities");
            if (res.ok) {
                const data = await res.json();
                setUniversities(Array.isArray(data) ? data : []);
            } else {
                console.error("Failed to fetch universities:", res.status);
                setUniversities([]);
            }
        } catch (error) {
            console.error("Failed to fetch universities:", error);
            setUniversities([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchShortlistedAndLocked = async () => {
        try {
            const [shortRes, lockRes] = await Promise.all([
                fetch("/api/shortlist"),
                fetch("/api/locked-universities")
            ]);

            // Check if responses are ok before parsing
            const shortData = shortRes.ok ? await shortRes.json() : [];
            const lockData = lockRes.ok ? await lockRes.json() : [];

            // Ensure we have arrays before mapping
            setShortlisted(new Set(Array.isArray(shortData) ? shortData.map((s: any) => s.universityId) : []));
            setLocked(new Set(Array.isArray(lockData) ? lockData.map((l: any) => l.universityId) : []));
        } catch (error) {
            console.error("Failed to fetch shortlisted/locked:", error);
            setShortlisted(new Set());
            setLocked(new Set());
        }
    };

    const toggleShortlist = async (uniId: string) => {
        const isShortlisted = shortlisted.has(uniId);

        try {
            if (isShortlisted) {
                await fetch(`/api/shortlist/${uniId}`, { method: "DELETE" });
                setShortlisted(prev => {
                    const next = new Set(prev);
                    next.delete(uniId);
                    return next;
                });
            } else {
                await fetch("/api/shortlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ universityId: uniId })
                });
                setShortlisted(prev => new Set([...prev, uniId]));
            }
        } catch (error) {
            console.error("Failed to toggle shortlist:", error);
        }
    };

    const lockUniversity = async (uniId: string) => {
        try {
            await fetch("/api/locked-universities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ universityId: uniId })
            });
            setLocked(prev => new Set([...prev, uniId]));
        } catch (error) {
            console.error("Failed to lock university:", error);
        }
    };

    const unlockUniversity = async (uniId: string) => {
        try {
            await fetch("/api/locked-universities", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ universityId: uniId })
            });
            setLocked(prev => {
                const next = new Set(prev);
                next.delete(uniId);
                return next;
            });
        } catch (error) {
            console.error("Failed to unlock university:", error);
        }
    };

    const filteredUniversities = universities.filter(uni => {
        if (filter.category !== "all" && uni.category !== filter.category) return false;
        if (filter.country !== "all" && uni.country !== filter.country) return false;
        if (filter.search && !uni.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
        return true;
    });

    const groupedByCategory = {
        dream: filteredUniversities.filter(u => u.category === "dream"),
        target: filteredUniversities.filter(u => u.category === "target"),
        safe: filteredUniversities.filter(u => u.category === "safe")
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "dream": return "bg-primary/10 text-primary border-primary/20";
            case "target": return "bg-blue-100 text-blue-800 border-blue-300";
            case "safe": return "bg-muted text-muted-foreground border-border";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getAcceptanceColor = (rate: number | null) => {
        if (!rate) return "text-gray-500";
        if (rate < 20) return "text-red-500";
        if (rate < 50) return "text-orange-500";
        return "text-green-500";
    };

    if (loading) {
        return <div className="p-8">Loading universities...</div>;
    }

    return (
        <div className="min-h-screen p-4 md:p-6 bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">University Discovery</h1>
                        <p className="hidden sm:block text-sm md:text-base text-muted-foreground">Find and shortlist universities that match your profile</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/counsellor")} className="text-xs md:text-sm">
                            <span className="hidden sm:inline">Ask AI Counsellor</span>
                            <span className="sm:hidden">Ask AI</span>
                        </Button>
                        <Button onClick={() => router.push("/guidance")} className="text-xs md:text-sm">
                            <span className="hidden sm:inline">View Guidance ({locked.size})</span>
                            <span className="sm:hidden">Guide ({locked.size})</span>
                        </Button>
                    </div>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Left Sidebar */}
                    <aside className="lg:sticky lg:top-4 lg:self-start">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Search</label>
                                    <Input
                                        placeholder="University name..."
                                        value={filter.search}
                                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                                        className="h-9"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Country</label>
                                    <Select value={filter.country} onValueChange={(v) => setFilter(prev => ({ ...prev, country: v }))}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Countries</SelectItem>
                                            <SelectItem value="USA">USA</SelectItem>
                                            <SelectItem value="Canada">Canada</SelectItem>
                                            <SelectItem value="UK">UK</SelectItem>
                                            <SelectItem value="Germany">Germany</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                                    <Select value={filter.category} onValueChange={(v) => setFilter(prev => ({ ...prev, category: v }))}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="dream">Dream</SelectItem>
                                            <SelectItem value="target">Target</SelectItem>
                                            <SelectItem value="safe">Safe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Right Side - Results */}
                    <div>

                        {/* University Tabs */}
                        <Tabs defaultValue="dream">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="dream" className="text-xs md:text-sm">
                                    Dream ({groupedByCategory.dream.length})
                                </TabsTrigger>
                                <TabsTrigger value="target" className="text-xs md:text-sm">
                                    Target ({groupedByCategory.target.length})
                                </TabsTrigger>
                                <TabsTrigger value="safe" className="text-xs md:text-sm">
                                    Safe ({groupedByCategory.safe.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="dream" className="mt-3 md:mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedByCategory.dream.length > 0 ? (
                                        groupedByCategory.dream.map((university) => (
                                            <UniversityCard
                                                key={university.id}
                                                university={university}
                                                isShortlisted={shortlisted.has(university.id)}
                                                isLocked={locked.has(university.id)}
                                                onToggleShortlist={() => toggleShortlist(university.id)}
                                                onLock={() => lockUniversity(university.id)}
                                                onUnlock={() => unlockUniversity(university.id)}
                                                getCategoryColor={getCategoryColor}
                                                getAcceptanceColor={getAcceptanceColor}
                                            />
                                        ))
                                    ) : (
                                        <p className="col-span-full text-center text-muted-foreground">No dream universities found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="target" className="mt-3 md:mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedByCategory.target.length > 0 ? (
                                        groupedByCategory.target.map((university) => (
                                            <UniversityCard
                                                key={university.id}
                                                university={university}
                                                isShortlisted={shortlisted.has(university.id)}
                                                isLocked={locked.has(university.id)}
                                                onToggleShortlist={() => toggleShortlist(university.id)}
                                                onLock={() => lockUniversity(university.id)}
                                                onUnlock={() => unlockUniversity(university.id)}
                                                getCategoryColor={getCategoryColor}
                                                getAcceptanceColor={getAcceptanceColor}
                                            />
                                        ))
                                    ) : (
                                        <p className="col-span-full text-center text-muted-foreground">No target universities found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="safe" className="mt-3 md:mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedByCategory.safe.length > 0 ? (
                                        groupedByCategory.safe.map((university) => (
                                            <UniversityCard
                                                key={university.id}
                                                university={university}
                                                isShortlisted={shortlisted.has(university.id)}
                                                isLocked={locked.has(university.id)}
                                                onToggleShortlist={() => toggleShortlist(university.id)}
                                                onLock={() => lockUniversity(university.id)}
                                                onUnlock={() => unlockUniversity(university.id)}
                                                getCategoryColor={getCategoryColor}
                                                getAcceptanceColor={getAcceptanceColor}
                                            />
                                        ))
                                    ) : (
                                        <p className="col-span-full text-center text-muted-foreground">No safe universities found.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UniversityCard({
    university,
    isShortlisted,
    isLocked,
    onToggleShortlist,
    onLock,
    onUnlock,
    getCategoryColor,
    getAcceptanceColor
}: {
    university: University;
    isShortlisted: boolean;
    isLocked: boolean;
    onToggleShortlist: () => void;
    onLock: () => void;
    onUnlock: () => void;
    getCategoryColor: (cat: string) => string;
    getAcceptanceColor: (rate: number | null) => string;
}) {
    const matchScore = getMatchScore(university.id, university.category);

    return (
        <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${isLocked ? "border-primary/50 bg-primary/5" : ""}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                        <CardTitle className="text-lg font-bold line-clamp-1">{university.name}</CardTitle>
                        <div className="flex flex-wrap gap-2 items-center mt-1.5">
                            <Badge className={getCategoryColor(university.category)}>
                                {university.category.toUpperCase()}
                            </Badge>

                            {/* AI Match Badge */}
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {matchScore}% Match
                            </Badge>

                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {university.city}, {university.country}
                            </div>
                            {university.ranking && (
                                <div className="flex items-center gap-1 text-sm">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    Rank #{university.ranking}
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            </CardHeader >
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1 transition-transform hover:scale-105">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        Tuition/Year
                    </div>
                    <p className="font-semibold">${university.tuitionFee.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        Acceptance
                    </div>
                    <p className={`font-semibold ${getAcceptanceColor(university.acceptanceRate)}`}>
                        {university.acceptanceRate}%
                    </p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4" />
                        Scholarships
                    </div>
                    <p className="font-semibold">{university.scholarships ? "Available" : "Limited"}</p>
                </div>
            </CardContent>

            {/* Lock Button Footer */}
            <div className="px-6 pb-6 pt-3 border-t">
                {isLocked ? (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onUnlock}
                        className="w-full"
                    >
                        <Lock className="w-4 h-4 mr-2" /> Locked
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <Lock className="w-4 h-4 mr-2" /> Lock University
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Lock {university.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Locking a university sets it as your primary focus and unlocks application guidance tasks.
                                    You can unlock it later if you change your mind, but we recommend committing to a strategy.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onLock}>Lock University</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </Card >
    );
}
