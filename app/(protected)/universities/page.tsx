import { universities, University } from "@/lib/universities";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, DollarSign, GraduationCap, MapPin, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UniversitiesPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const dreamUniversities = universities.filter(u => u.category === "dream");
    const targetUniversities = universities.filter(u => u.category === "target");
    const safeUniversities = universities.filter(u => u.category === "safe");

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">University Discovery</h1>
                <p className="text-muted-foreground">
                    AI-recommended universities based on your profile, categorized by fit
                </p>
            </div>

            {/* Dream Universities */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Dream Universities</h2>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        {dreamUniversities.length} universities
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Highly competitive, world-class institutions. Excellent fit but challenging admission.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dreamUniversities.map(uni => <UniversityCard key={uni.id} university={uni} />)}
                </div>
            </section>

            {/* Target Universities */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Target Universities</h2>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        {targetUniversities.length} universities
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Strong match for your profile. Competitive but realistic with solid preparation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {targetUniversities.map(uni => <UniversityCard key={uni.id} university={uni} />)}
                </div>
            </section>

            {/* Safe Universities */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Safe Universities</h2>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        {safeUniversities.length} universities
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    High probability of acceptance. Good programs with more accessible admission criteria.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safeUniversities.map(uni => <UniversityCard key={uni.id} university={uni} />)}
                </div>
            </section>
        </div>
    );
}

function UniversityCard({ university }: { university: University }) {
    const categoryColors = {
        dream: "border-purple-500/20 bg-purple-500/5",
        target: "border-blue-500/20 bg-blue-500/5",
        safe: "border-green-500/20 bg-green-500/5"
    };

    const categoryBadge = {
        dream: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        target: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        safe: "bg-green-500/10 text-green-500 border-green-500/20"
    };

    return (
        <Card className={`${categoryColors[university.category]} border`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{university.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3 w-3" />
                            {university.location}, {university.country}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className={categoryBadge[university.category]}>
                        #{university.ranking}
                    </Badge>
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
                <Button variant="outline" size="sm" className="w-full">
                    Lock University
                </Button>
            </CardFooter>
        </Card>
    );
}
