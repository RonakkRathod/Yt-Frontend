"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { getLikedVideos, LikedVideo } from "@/services/like.service";
import { Skeleton } from "@/components/ui/skeleton";
import { MdThumbUp } from "react-icons/md";
import { toast } from "sonner";

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
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function LikedVideoCard({ video, index }: { video: LikedVideo; index: number }) {
  return (
    <Link
      href={`/watch/${video._id}`}
      className="flex gap-4 group hover:bg-secondary/50 p-2 rounded-lg transition-colors"
    >
      {/* Index Number */}
      <div className="flex items-center justify-center w-8 text-muted-foreground text-sm">
        {index + 1}
      </div>

      {/* Thumbnail */}
      <div className="relative w-40 sm:w-48 shrink-0">
        <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
          <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Video Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {video.ownerDetails?.username || video.ownerDetails?.fullName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
        </p>
      </div>
    </Link>
  );
}

function VideoSkeleton() {
  return (
    <div className="flex gap-4 p-2">
      <div className="w-8 flex items-center justify-center">
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="w-40 sm:w-48 shrink-0 aspect-video rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function LikedVideosPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [videos, setVideos] = useState<LikedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Redirect to sign in if not authenticated
    if (!isAuthenticated) {
      toast.error("Please sign in to view liked videos");
      router.push("/sign-in");
      return;
    }

    // Fetch liked videos
    getLikedVideos()
      .then((data) => {
        setVideos(data);
      })
      .catch((err) => {
        console.error("Failed to fetch liked videos:", err);
        setError(err.message || "Failed to load liked videos");
        toast.error("Failed to load liked videos");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex pt-14">
            <AppSidebar />
            <SidebarInset className="flex-1 overflow-x-hidden">
              <main className="w-full p-6">
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <VideoSkeleton key={i} />
                    ))}
                </div>
              </main>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-x-hidden">
            <main className="w-full">
              <div className="max-w-5xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <MdThumbUp className="text-2xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Liked videos</h1>
                    <p className="text-sm text-muted-foreground">
                      {videos.length} {videos.length === 1 ? "video" : "videos"}
                    </p>
                  </div>
                </div>

                {/* Video List */}
                {loading ? (
                  <div className="space-y-2">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <VideoSkeleton key={i} />
                      ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <MdThumbUp className="text-6xl text-muted-foreground mb-4" />
                    <h2 className="text-xl font-medium text-foreground mb-2">
                      No liked videos yet
                    </h2>
                    <p className="text-muted-foreground text-center max-w-md">
                      Videos you like will appear here. Start exploring and like
                      videos you enjoy!
                    </p>
                    <Link
                      href="/"
                      className="mt-4 text-primary hover:underline"
                    >
                      Browse videos
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {videos.map((video, index) => (
                      <LikedVideoCard key={video._id} video={video} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
