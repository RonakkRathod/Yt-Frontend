"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getUserVideos, UserVideo } from "@/services/video.service";
import { toast } from "sonner";
import { HiOutlineVideoCamera } from "react-icons/hi";

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

function formatTimeAgo(dateString: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "Today";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="aspect-video rounded-xl bg-secondary" />
        <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
      </div>
    </div>
  );
}

function StudioVideoCard({ video }: { video: UserVideo }) {
  return (
    <div className="flex flex-col gap-2 group">
      <Link
        href={`/watch/${video._id}`}
        className="aspect-video rounded-xl overflow-hidden bg-secondary relative"
      >
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {!video.isPublished && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded">
            Draft
          </div>
        )}
      </Link>

      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary shrink-0 overflow-hidden">
          {video.ownerDetails?.avatar?.url && (
            <img
              src={video.ownerDetails.avatar.url}
              alt={video.ownerDetails.username}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {video.ownerDetails?.username}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user videos
  useEffect(() => {
    if (!user?._id) return;

    setLoading(true);
    getUserVideos(user._id)
      .then(setVideos)
      .catch((err) => {
        setError(err.message);
        toast.error("Failed to load your videos");
      })
      .finally(() => setLoading(false));
  }, [user?._id]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <SidebarProvider defaultOpen>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex pt-14">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <main className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <VideoCardSkeleton key={i} /> // skeleton loaders
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
    <SidebarProvider defaultOpen>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <main className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-foreground">
                  Your Videos
                </h1>
                <Button
                  onClick={() => router.push("/upload")}
                  className="flex items-center gap-2 rounded-md"
                >
                  <HiOutlineVideoCamera className="text-lg" />
                  Upload Video
                </Button>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {loading ? (
                  Array(8)
                    .fill(0)
                    .map((_, i) => <VideoCardSkeleton key={i} />)
                ) : error ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                ) : videos.length === 0 ? (
                  // Empty State
                  <div className="col-span-full flex flex-col items-center justify-center py-20">
                    <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
                      <HiOutlineVideoCamera className="text-4xl text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      No videos yet
                    </h2>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You haven&apos;t uploaded any videos yet. Start sharing
                      your content with the world!
                    </p>
                    <Button
                      onClick={() => router.push("/upload")}
                      className="flex items-center gap-2"
                    >
                      <HiOutlineVideoCamera className="text-lg" />
                      Upload your first video
                    </Button>
                  </div>
                ) : (
                  videos.map((video) => (
                    <StudioVideoCard key={video._id} video={video} />
                  ))
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
