"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, MapPin, DollarSign, TrendingUp, Heart, Lock, Star, Globe, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
            case "dream": return "bg-purple-100 text-purple-800 border-purple-300";
            case "target": return "bg-blue-100 text-blue-800 border-blue-300";
            case "safe": return "bg-green-100 text-green-800 border-green-300";
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
        <div className="min-h-screen p-6 bg-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">University Discovery</h1>
                        <p className="text-muted-foreground">Find and shortlist universities that match your profile</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/counsellor")}>
                            Ask AI Counsellor
                        </Button>
                        <Button onClick={() => router.push("/guidance")}>
                            View Guidance ({locked.size} locked)
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                placeholder="Search universities..."
                                value={filter.search}
                                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                            />
                            <Select value={filter.country} onValueChange={(v) => setFilter(prev => ({ ...prev, country: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Countries</SelectItem>
                                    <SelectItem value="USA">USA</SelectItem>
                                    <SelectItem value="Canada">Canada</SelectItem>
                                    <SelectItem value="UK">UK</SelectItem>
                                    <SelectItem value="Germany">Germany</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filter.category} onValueChange={(v) => setFilter(prev => ({ ...prev, category: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
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

                {/* University Tabs */}
                <Tabs defaultValue="dream">
                    <TabsList>
                        <TabsTrigger value="dream">
                            Dream ({groupedByCategory.dream.length})
                        </TabsTrigger>
                        <TabsTrigger value="target">
                            Target ({groupedByCategory.target.length})
                        </TabsTrigger>
                        <TabsTrigger value="safe">
                            Safe ({groupedByCategory.safe.length})
                        </TabsTrigger>
                        <TabsTrigger value="shortlisted">
                            Shortlisted ({shortlisted.size})
                        </TabsTrigger>
                    </TabsList>

                    {(["dream", "target", "safe"] as const).map(category => (
                        <TabsContent key={category} value={category} className="space-y-4">
                            {groupedByCategory[category].length > 0 ? (
                                groupedByCategory[category].map(uni => (
                                    <UniversityCard
                                        key={uni.id}
                                        university={uni}
                                        isShortlisted={shortlisted.has(uni.id)}
                                        isLocked={locked.has(uni.id)}
                                        onToggleShortlist={() => toggleShortlist(uni.id)}
                                        onLock={() => lockUniversity(uni.id)}
                                        getCategoryColor={getCategoryColor}
                                        getAcceptanceColor={getAcceptanceColor}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Globe className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">
                                        No {category === "dream" ? "Dream" : category === "target" ? "Target" : "Safe"} Universities Found
                                    </h3>
                                    <p className="text-muted-foreground mb-6 max-w-md">
                                        Adjust your filters or check back later. Our AI counsellor can help you discover more universities.
                                    </p>
                                    <Link href="/counsellor">
                                        <Button variant="outline">
                                            Ask AI Counsellor
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </TabsContent>
                    ))}

                    <TabsContent value="shortlisted" className="space-y-4">
                        {filteredUniversities.filter(u => shortlisted.has(u.id)).length > 0 ? (
                            filteredUniversities.filter(u => shortlisted.has(u.id)).map(uni => (
                                <UniversityCard
                                    key={uni.id}
                                    university={uni}
                                    isShortlisted={true}
                                    isLocked={locked.has(uni.id)}
                                    onToggleShortlist={() => toggleShortlist(uni.id)}
                                    onLock={() => lockUniversity(uni.id)}
                                    getCategoryColor={getCategoryColor}
                                    getAcceptanceColor={getAcceptanceColor}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Heart className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">No Universities Shortlisted</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Click the heart icon on any university card to add it to your shortlist. This helps you track your favorite options.
                                </p>
                                <Link href="#universities">
                                    <Button variant="outline">
                                        Browse Universities
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
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
    getCategoryColor,
    getAcceptanceColor
}: {
    university: University;
    isShortlisted: boolean;
    isLocked: boolean;
    onToggleShortlist: () => void;
    onLock: () => void;
    getCategoryColor: (cat: string) => string;
    getAcceptanceColor: (rate: number | null) => string;
}) {
    return (
        <Card className={`transition-all duration-300 hover:shadow-xl ${isLocked ? "border-2 border-primary ring-2 ring-primary/20" : "hover:scale-[1.01]"}`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{university.name}</CardTitle>
                            {isLocked && <Badge variant="default" className="animate-pulse"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge className={getCategoryColor(university.category)}>
                                {university.category.toUpperCase()}
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
                    <div className="flex gap-2">
                        <Button
                            variant={isShortlisted ? "default" : "outline"}
                            size="sm"
                            onClick={onToggleShortlist}
                            disabled={isLocked}
                            className="transition-transform hover:scale-110"
                        >
                            <Heart className={`w-4 h-4 transition-all ${isShortlisted ? "fill-current scale-110" : ""}`} />
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={onLock}
                            disabled={isLocked}
                            className="transition-transform hover:scale-110"
                        >
                            <Lock className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
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
        </Card>
    );
}
