"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getWatchHistory, WatchHistoryVideo, getThumbnailUrl, getAvatarUrl } from "@/services/history.service";
import { toast } from "sonner";
import { MdHistory, MdOutlineDelete } from "react-icons/md";
import { FiSearch } from "react-icons/fi";

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

function HistoryVideoCard({ video }: { video: WatchHistoryVideo }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const thumbnailUrl = getThumbnailUrl(video.thumbnail);
  const avatarUrl = getAvatarUrl(video.owner?.avatar);

  return (
    <div className="flex gap-4 group">
      {/* Thumbnail */}
      <Link href={`/watch/${video._id}`} className="relative w-64 shrink-0">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={thumbnailUrl}
            alt={video.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
      </Link>

      {/* Video Info */}
      <div className="flex-1 min-w-0 py-1">
        <Link href={`/watch/${video._id}`}>
          <h3 className="text-base font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
        </Link>
        <Link 
          href={`/channel/${video.owner?.username}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {video.owner?.fullName || video.owner?.username}
        </Link>
        <p className="text-sm text-muted-foreground">
          {formatViews(video.views)} • {formatTimeAgo(video.createdAt)}
        </p>
        {video.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}

function HistoryVideoSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="w-64 shrink-0 aspect-video rounded-xl" />
      <div className="flex-1 py-1 space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [videos, setVideos] = useState<WatchHistoryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    getWatchHistory()
      .then((data) => {
        setVideos(data);
      })
      .catch((err) => {
        console.error("History fetch error:", err);
        toast.error("Failed to load watch history");
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  // Filter videos by search query
  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.owner?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-x-hidden">
            <main className="p-6">
              <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <MdHistory className="text-3xl text-foreground" />
                  <h1 className="text-2xl font-semibold text-foreground">
                    Watch history
                  </h1>
                </div>

                <div className="flex gap-8">
                  {/* Main Content */}
                  <div className="flex-1">
                    {loading ? (
                      <div className="space-y-6">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <HistoryVideoSkeleton key={i} />
                          ))}
                      </div>
                    ) : filteredVideos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <MdHistory className="text-6xl text-muted-foreground mb-4" />
                        <p className="text-xl font-medium text-foreground mb-2">
                          {searchQuery ? "No videos found" : "No watch history yet"}
                        </p>
                        <p className="text-muted-foreground text-center">
                          {searchQuery
                            ? "Try a different search term"
                            : "Videos you watch will appear here"}
                        </p>
                        {!searchQuery && (
                          <Link href="/" className="mt-4">
                            <Button>Browse videos</Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Today Section */}
                        <div>
                          <h2 className="text-lg font-medium text-foreground mb-4">
                            Today
                          </h2>
                          <div className="space-y-4">
                            {filteredVideos.map((video) => (
                              <HistoryVideoCard key={video._id} video={video} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="w-72 shrink-0 hidden lg:block">
                    {/* Search in history */}
                    <div className="relative mb-6">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search watch history"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-border focus:border-foreground outline-none text-foreground placeholder:text-muted-foreground transition-colors"
                      />
                    </div>

                    {/* History Type */}
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary text-foreground font-medium">
                        <MdHistory className="text-xl" />
                        Watch history
                      </button>
                    </div>

                    {/* Clear History */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <button 
                        onClick={() => {
                          setVideos([]);
                          toast.success("Watch history cleared");
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                      >
                        <MdOutlineDelete className="text-xl" />
                        <span className="text-sm">Clear all watch history</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
