"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPopularVideos, YouTubeVideo } from "@/services/youtube.service";
import { RiShareForwardLine } from "react-icons/ri";
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from "react-icons/ai";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { toast } from "sonner";

function formatViews(count?: string): string {
  if (!count) return "";
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
  return `${num} views`;
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

function SuggestedVideoCard({ video }: { video: YouTubeVideo }) {
  return (
    <Link href={`/youtube/${video.id}`} className="flex gap-3 group">
      <div className="relative w-48 shrink-0">
        <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {video.channelTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatViews(video.viewCount)} • {formatTimeAgo(video.publishedAt)}
        </p>
      </div>
    </Link>
  );
}

function SuggestedSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="w-40 shrink-0 aspect-video rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function YouTubeWatchPage() {
  const params = useParams();
  const videoId = params.videoId as string;

  const [suggestions, setSuggestions] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    // Fetch suggested videos from YouTube API
    getPopularVideos(15)
      .then(setSuggestions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load like status from localStorage for YouTube videos
  useEffect(() => {
    if (videoId) {
      const likedVideos = JSON.parse(localStorage.getItem("ytLikedVideos") || "[]");
      const dislikedVideos = JSON.parse(localStorage.getItem("ytDislikedVideos") || "[]");
      setIsLiked(likedVideos.includes(videoId));
      setIsDisliked(dislikedVideos.includes(videoId));
    }
  }, [videoId]);

  const handleLike = () => {
    const likedVideos = JSON.parse(localStorage.getItem("ytLikedVideos") || "[]");
    const dislikedVideos = JSON.parse(localStorage.getItem("ytDislikedVideos") || "[]");

    if (isLiked) {
      // Unlike
      const updated = likedVideos.filter((id: string) => id !== videoId);
      localStorage.setItem("ytLikedVideos", JSON.stringify(updated));
      setIsLiked(false);
    } else {
      // Like and remove dislike if exists
      likedVideos.push(videoId);
      localStorage.setItem("ytLikedVideos", JSON.stringify(likedVideos));
      setIsLiked(true);
      
      if (isDisliked) {
        const updatedDislikes = dislikedVideos.filter((id: string) => id !== videoId);
        localStorage.setItem("ytDislikedVideos", JSON.stringify(updatedDislikes));
        setIsDisliked(false);
      }
      toast.success("Added to liked videos");
    }
  };

  const handleDislike = () => {
    const likedVideos = JSON.parse(localStorage.getItem("ytLikedVideos") || "[]");
    const dislikedVideos = JSON.parse(localStorage.getItem("ytDislikedVideos") || "[]");

    if (isDisliked) {
      // Remove dislike
      const updated = dislikedVideos.filter((id: string) => id !== videoId);
      localStorage.setItem("ytDislikedVideos", JSON.stringify(updated));
      setIsDisliked(false);
    } else {
      // Dislike and remove like if exists
      dislikedVideos.push(videoId);
      localStorage.setItem("ytDislikedVideos", JSON.stringify(dislikedVideos));
      setIsDisliked(true);
      
      if (isLiked) {
        const updatedLikes = likedVideos.filter((id: string) => id !== videoId);
        localStorage.setItem("ytLikedVideos", JSON.stringify(updatedLikes));
        setIsLiked(false);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (!videoId) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-14 p-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
            <p className="text-muted-foreground">No video selected</p>
          </main>
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
              <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
                {/* Main Video Section */}
                <div className="w-full lg:w-3/4">
                    {/* YouTube Embedded Player */}
                    <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {/* Like/Dislike Segment */}
                      <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLike}
                          className={`rounded-none rounded-l-full gap-2 px-4 hover:bg-secondary/80 ${isLiked ? "bg-secondary" : ""}`}
                        >
                          {isLiked ? (
                            <AiFillLike className="text-lg" />
                          ) : (
                            <AiOutlineLike className="text-lg" />
                          )}
                        </Button>
                        <div className="w-px h-6 bg-border" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDislike}
                          className={`rounded-none rounded-r-full px-4 hover:bg-secondary/80 ${isDisliked ? "bg-secondary" : ""}`}
                        >
                          {isDisliked ? (
                            <AiFillDislike className="text-lg" />
                          ) : (
                            <AiOutlineDislike className="text-lg" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleShare}
                        className="rounded-full gap-2"
                      >
                        <RiShareForwardLine className="text-lg" />
                        Share
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full gap-2"
                      >
                        <MdOutlinePlaylistAdd className="text-lg" />
                        Save
                      </Button>
                      <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" size="sm" className="rounded-full">
                          Watch on YouTube
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Suggested Videos Sidebar */}
                  <div className="w-full lg:w-1/4">
                    <h2 className="text-base font-medium text-foreground mb-4">
                      Suggested videos
                    </h2>
                    <div className="space-y-4">
                      {loading
                        ? Array(5)
                            .fill(0)
                            .map((_, i) => <SuggestedSkeleton key={i} />)
                        : suggestions
                            .filter((v) => v.id !== videoId)
                            .map((v) => <SuggestedVideoCard key={v.id} video={v} />)}
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
