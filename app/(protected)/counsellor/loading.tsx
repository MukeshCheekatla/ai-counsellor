import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CounsellorLoading() {
    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl h-[calc(100vh-64px-80px)] lg:h-[calc(100vh-64px)] flex flex-col">
            <Card className="flex-1 flex flex-col shadow-xl border-border/50">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 relative">
                    <div className="h-full p-4 md:p-6 flex flex-col items-center justify-center gap-4 opacity-70">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 text-center">
                            <Skeleton className="h-6 w-48 mx-auto" />
                            <Skeleton className="h-4 w-96 mx-auto" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-40" />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-4 border-t bg-muted/10">
                    <div className="flex w-full items-center space-x-2">
                        <Skeleton className="flex-1 h-12 rounded-xl" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
