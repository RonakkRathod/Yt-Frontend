"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export interface UserVideoCardData {
  _id: string;
  title: string;
  thumbnail: string | { url: string };
  duration: number;
  views: number;
  createdAt: string;
  ownerDetails?: {
    username: string;
    avatar?: { url: string };
  };
}

interface UserVideoCardProps {
  video: UserVideoCardData;
  showChannel?: boolean;
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getThumbnailUrl(thumbnail: string | { url: string }): string {
  if (typeof thumbnail === 'string') return thumbnail;
  return thumbnail?.url || '';
}

export function UserVideoCard({ video, showChannel = true }: UserVideoCardProps) {
  const thumbnailUrl = getThumbnailUrl(video.thumbnail);
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when video changes
  useEffect(() => {
    setIsLoading(true);
  }, [video._id]);

  return (
    <div className="flex flex-col gap-2 group">
      <Link href={`/watch/${video._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        {/* Skeleton shown while image is loading */}
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full z-10" />
        )}
        <img
          src={thumbnailUrl}
          alt={video.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded z-20">
          {formatDuration(video.duration)}
        </span>
      </Link>

      <div className="flex gap-3">
        {showChannel && video.ownerDetails?.avatar?.url && (
          <Link href={`/channel/${video.ownerDetails.username}`}>
            <div className="w-9 h-9 rounded-full bg-secondary shrink-0 overflow-hidden">
              <img
                src={video.ownerDetails.avatar.url}
                alt={video.ownerDetails.username}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        )}
        {showChannel && !video.ownerDetails?.avatar?.url && (
          <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
            {video.title}
          </h3>
          {showChannel && video.ownerDetails?.username && (
            <Link 
              href={`/channel/${video.ownerDetails.username}`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {video.ownerDetails.username}
            </Link>
          )}
          <p className="text-xs text-muted-foreground">
            {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
