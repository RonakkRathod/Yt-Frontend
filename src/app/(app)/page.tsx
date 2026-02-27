"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { VideoCard } from "@/components/VideoCard";
import { VideoCardSkeleton } from "@/components/VideoCardSkeleton";
import { getPopularVideos, YouTubeVideo } from "@/services/youtube.service";
import { toast } from "sonner";

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPopularVideos(20)
      .then(setVideos)
      .catch((err) => {
        setError(err.message);
        toast.error("Failed to load videos");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <main className="p-6">
              <h1 className="text-2xl font-semibold text-foreground mb-6">
                Home
              </h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {loading ? (
                  Array(12).fill(0).map((_, i) => <VideoCardSkeleton key={i} />)
                ) : error ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-muted-foreground">No videos found</p>
                  </div>
                ) : (
                  videos.map((video) => <VideoCard key={video.id} video={video} />)
                )}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
