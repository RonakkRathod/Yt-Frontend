import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {/* Thumbnail Skeleton */}
      <Skeleton className="aspect-video rounded-xl w-full" />

      {/* Video Info Skeleton */}
      <div className="flex gap-3">
        {/* Channel Avatar Skeleton */}
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />

        {/* Title and Details Skeleton */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
