import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UniversitiesLoading() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-24" />
                ))}
            </div>

            {/* University Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="h-8 w-16 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
