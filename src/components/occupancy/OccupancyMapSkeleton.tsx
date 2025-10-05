import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const OccupancyMapSkeleton = () => {
  const daysToShow = 14;
  const accommodationsCount = 8;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden p-6">
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header row */}
            <div className="flex border-b mb-2">
              <div className="w-40 flex-shrink-0 p-2">
                <Skeleton className="h-5 w-full" />
              </div>
              {Array.from({ length: daysToShow }).map((_, i) => (
                <div key={i} className="w-32 flex-shrink-0 p-2 border-l">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>

            {/* Accommodation rows */}
            {Array.from({ length: accommodationsCount }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex border-b">
                <div className="w-40 flex-shrink-0 p-2 border-r">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <Skeleton className="h-5 w-20" />
                </div>
                {Array.from({ length: daysToShow }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="w-32 flex-shrink-0 border-l min-h-[72px] p-2"
                  >
                    {Math.random() > 0.4 && (
                      <Skeleton className="h-full w-full" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
