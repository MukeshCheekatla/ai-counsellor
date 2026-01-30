import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuidanceLoading() {
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <Skeleton className="h-5 w-5 rounded mt-1" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
