"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getVideoById, getAllVideos, VideoDetails, UserVideo } from "@/services/video.service";
import { toggleVideoLike } from "@/services/like.service";
import { toggleSubscription } from "@/services/subscription.service";
import { toast } from "sonner";
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from "react-icons/ai";
import { RiShareForwardLine } from "react-icons/ri";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { Skeleton } from "@/components/ui/skeleton";

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

function SuggestedVideoCard({ video }: { video: UserVideo }) {
  return (
    <Link href={`/watch/${video._id}`} className="flex gap-3 group">
      <div className="relative w-48 shrink-0">
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
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {video.ownerDetails?.username}
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
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-4 mt-4">
        <Skeleton className="h-7 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
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

export default function WatchPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const { isAuthenticated } = useAuth();

  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [suggestions, setSuggestions] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setError("No video ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch video details
    getVideoById(videoId)
      .then((data) => {
        setVideo(data);
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
        setIsSubscribed(data.owner?.isSubscribed || false);
        setSubscriberCount(data.owner?.subscriberscount || 0);
      })
      .catch((err) => {
        setError(err.message || "Failed to load video");
        toast.error("Failed to load video");
      })
      .finally(() => setLoading(false));

    // Fetch suggested videos
    getAllVideos(10)
      .then(setSuggestions)
      .catch(() => {
        // Silently fail for suggestions
      });
  }, [videoId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like videos");
      return;
    }

    if (isLiking) return; // Prevent multiple clicks

    setIsLiking(true);
    
    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    
    // Clear dislike if liking
    if (!isLiked && isDisliked) {
      setIsDisliked(false);
    }

    try {
      const response = await toggleVideoLike(videoId);
      // Sync with server response
      setIsLiked(response.isLiked);
      if (response.isLiked) {
        toast.success("Added to liked videos");
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      toast.error("Failed to update like status");
      console.error("Like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to dislike videos");
      return;
    }
    
    // Toggle dislike
    setIsDisliked(!isDisliked);
    
    // If disliking and currently liked, remove like
    if (!isDisliked && isLiked) {
      setIsLiked(false);
      setLikesCount(likesCount - 1);
      // Also call API to remove like
      toggleVideoLike(videoId).catch(console.error);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe");
      return;
    }

    if (!video?.owner?._id) {
      toast.error("Channel not found");
      return;
    }

    if (isSubscribing) return; // Prevent multiple clicks

    setIsSubscribing(true);

    // Optimistic update
    const previousIsSubscribed = isSubscribed;
    const previousSubscriberCount = subscriberCount;
    setIsSubscribed(!isSubscribed);
    setSubscriberCount(isSubscribed ? subscriberCount - 1 : subscriberCount + 1);

    try {
      const newStatus = await toggleSubscription(video.owner._id);
      setIsSubscribed(newStatus);
      
      if (newStatus) {
        toast.success(`Subscribed to ${video.owner.username}`);
      } else {
        toast.success(`Unsubscribed from ${video.owner.username}`);
      }
    } catch (error) {
      // Revert on error
      setIsSubscribed(previousIsSubscribed);
      setSubscriberCount(previousSubscriberCount);
      toast.error("Failed to update subscription");
      console.error("Subscription error:", error);
    } finally {
      setIsSubscribing(false);
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
                  {loading ? (
                    <VideoSkeleton />
                  ) : error ? (
                    <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center">
                      <p className="text-muted-foreground">{error}</p>
                    </div>
                  ) : video ? (
                    <>
                      {/* Video Player */}
                      <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
                        <video
                          src={video.videoFile?.url}
                          controls
                          autoPlay
                          className="w-full h-full"
                        />
                      </div>

                      {/* Video Title */}
                      <h1 className="text-xl font-semibold text-foreground mb-2">
                        {video.title}
                      </h1>

                      {/* Video Info & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        {/* Channel Info */}
                        <div className="flex items-center gap-3">
                          <Link href={`/channel/${video.owner?.username}`} className="w-10 h-10 rounded-full bg-secondary overflow-hidden hover:opacity-80 transition-opacity">
                            {video.owner?.avatar?.url && (
                              <img
                                src={video.owner.avatar.url}
                                alt={video.owner.username}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </Link>
                          <div>
                            <Link href={`/channel/${video.owner?.username}`} className="font-medium text-foreground hover:text-primary transition-colors">
                              {video.owner?.username}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {subscriberCount.toLocaleString()} subscribers
                            </p>
                          </div>
                          <Button
                            variant={isSubscribed ? "secondary" : "default"}
                            size="sm"
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                            className={`ml-2 rounded-full font-medium ${isSubscribed ? "bg-secondary hover:bg-secondary/80" : "bg-foreground text-background hover:bg-foreground/90"}`}
                          >
                            {isSubscribing ? "..." : isSubscribed ? "Subscribed" : "Subscribe"}
                          </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Like/Dislike Segment */}
                          <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleLike}
                              disabled={isLiking}
                              className={`rounded-none rounded-l-full gap-2 px-4 hover:bg-secondary/80 ${isLiked ? "bg-secondary" : ""}`}
                            >
                              {isLiked ? (
                                <AiFillLike className="text-lg" />
                              ) : (
                                <AiOutlineLike className="text-lg" />
                              )}
                              <span className="font-medium">
                                {likesCount > 0 ? likesCount.toLocaleString() : ""}
                              </span>
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
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-secondary/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-sm text-foreground mb-2">
                          <span>{formatViews(video.views)}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(video.createdAt)}</span>
                        </div>
                        {video.description && (
                          <div>
                            <p
                              className={`text-sm text-foreground whitespace-pre-wrap ${
                                !showFullDescription ? "line-clamp-3" : ""
                              }`}
                            >
                              {video.description}
                            </p>
                            {video.description.length > 200 && (
                              <button
                                onClick={() => setShowFullDescription(!showFullDescription)}
                                className="text-sm font-medium text-foreground mt-2"
                              >
                                {showFullDescription ? "Show less" : "...more"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>

                  {/* Suggested Videos Sidebar */}
                  <div className="w-full lg:w-1/4">
              <h2 className="text-base font-medium text-foreground mb-4">
                Suggested videos
              </h2>
              <div className="space-y-4">
                {suggestions.length === 0
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => <SuggestedSkeleton key={i} />)
                  : suggestions
                      .filter((v) => v._id !== videoId)
                      .map((v) => <SuggestedVideoCard key={v._id} video={v} />)}
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