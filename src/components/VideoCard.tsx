"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { YouTubeVideo } from "@/services/youtube.service";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoCardProps {
  video: YouTubeVideo;
}

function formatViews(count?: string): string {
  if (!count) return "";
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
  return `${num} views`;
}

function formatTimeAgo(dateString: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function VideoCard({ video }: VideoCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col gap-2 group">
      <Link href={`/youtube/${video.id}`} className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        {/* Skeleton shown while image is loading */}
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full z-10" />
        )}
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover group-hover:scale-105 transition-all duration-300 ${
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          priority={false}
        />
      </Link>

      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
          <p className="text-xs text-muted-foreground">
            {formatViews(video.viewCount)} • {formatTimeAgo(video.publishedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
