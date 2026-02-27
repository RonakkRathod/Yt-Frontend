"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getChannelProfile, ChannelProfile, getAvatarUrl, getCoverImageUrl, updateCoverImage, updateAvatar } from "@/services/channel.service";
import { getUserVideos, UserVideo } from "@/services/video.service";
import { toggleSubscription } from "@/services/subscription.service";
import { UserVideoCard } from "@/components/UserVideoCard";
import { VideoCardSkeleton } from "@/components/VideoCardSkeleton";
import { toast } from "sonner";
import { MdVerified } from "react-icons/md";
import { MdCameraAlt } from "react-icons/md";
import { useRef } from "react";

function formatSubscribers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function ChannelHeader({
  channel,
  isSubscribed,
  subscriberCount,
  onSubscribe,
  isSubscribing,
  isOwnChannel,
  onCoverUpdate,
  onAvatarUpdate,
  isUpdatingCover,
  isUpdatingAvatar,
}: {
  channel: ChannelProfile;
  isSubscribed: boolean;
  subscriberCount: number;
  onSubscribe: () => void;
  isSubscribing: boolean;
  isOwnChannel: boolean;
  onCoverUpdate?: (file: File) => void;
  onAvatarUpdate?: (file: File) => void;
  isUpdatingCover?: boolean;
  isUpdatingAvatar?: boolean;
}) {
  const avatarUrl = getAvatarUrl(channel.avatar);
  const coverUrl = getCoverImageUrl(channel.CoverImage);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCoverUpdate) {
      onCoverUpdate(file);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpdate) {
      onAvatarUpdate(file);
    }
  };

  return (
    <div className="w-full">
      {/* Cover Image - Full Width */}
      <div className="relative w-full h-40 sm:h-52 lg:h-64 xl:h-72 bg-secondary overflow-hidden group">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${channel.username}'s cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-primary/20 via-primary/10 to-secondary" />
        )}
        
        {/* Cover Upload Button */}
        {isOwnChannel && (
          <>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverChange}
              accept="image/*"
              className="hidden"
              aria-label="Upload cover image"
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={isUpdatingCover}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <MdCameraAlt className="text-lg" />
              {isUpdatingCover ? "Uploading..." : "Edit cover"}
            </button>
          </>
        )}
      </div>

      {/* Channel Info */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-secondary overflow-hidden border-4 border-background -mt-10 sm:-mt-16">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={channel.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-3xl sm:text-4xl font-bold text-primary">
                  {channel.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Avatar Upload Button */}
            {isOwnChannel && (
              <>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload avatar"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUpdatingAvatar}
                  className="absolute bottom-0 right-0 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  aria-label="Change avatar"
                  title="Change avatar"
                >
                  <MdCameraAlt className="text-lg" />
                </button>
              </>
            )}
          </div>

        {/* Channel Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{channel.fullName}</h1>
            <MdVerified className="text-primary text-xl" />
          </div>
          <p className="text-muted-foreground">@{channel.username}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatSubscribers(subscriberCount)} subscribers • {channel.channelSubscribedToCount} subscriptions
          </p>
        </div>

        {/* Subscribe Button */}
        {!isOwnChannel && (
          <Button
            variant={isSubscribed ? "secondary" : "default"}
            onClick={onSubscribe}
            disabled={isSubscribing}
            className={`rounded-full px-6 font-medium ${
              isSubscribed
                ? "bg-secondary hover:bg-secondary/80"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {isSubscribing ? "..." : isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        )}

        {isOwnChannel && (
          <Link href="/studio">
            <Button variant="secondary" className="rounded-full px-6">
              Customize channel
            </Button>
          </Link>
        )}
        </div>
      </div>
    </div>
  );
}

function ChannelHeaderSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="w-full h-40 sm:h-52 lg:h-64 xl:h-72" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
          <Skeleton className="w-20 h-20 sm:w-32 sm:h-32 rounded-full -mt-10 sm:-mt-16" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ChannelPage() {
  const params = useParams();
  const username = params.username as string;
  const { user, isAuthenticated } = useAuth();

  const [channel, setChannel] = useState<ChannelProfile | null>(null);
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const isOwnChannel = user?.username?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    if (!username) {
      setError("No channel specified");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch channel profile
    getChannelProfile(username)
      .then((data) => {
        setChannel(data);
        setIsSubscribed(data.isSubscribed);
        setSubscriberCount(data.subscriberesCount);

        // Fetch channel videos
        setVideosLoading(true);
        return getUserVideos(data._id);
      })
      .then((videosData) => {
        setVideos(videosData);
      })
      .catch((err) => {
        console.error("Channel fetch error:", err);
        setError(err.response?.data?.message || "Failed to load channel");
        toast.error("Failed to load channel");
      })
      .finally(() => {
        setLoading(false);
        setVideosLoading(false);
      });
  }, [username]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe");
      return;
    }

    if (!channel?._id) {
      toast.error("Channel not found");
      return;
    }

    if (isSubscribing) return;

    setIsSubscribing(true);

    // Optimistic update
    const previousIsSubscribed = isSubscribed;
    const previousSubscriberCount = subscriberCount;
    setIsSubscribed(!isSubscribed);
    setSubscriberCount(isSubscribed ? subscriberCount - 1 : subscriberCount + 1);

    try {
      const newStatus = await toggleSubscription(channel._id);
      setIsSubscribed(newStatus);

      if (newStatus) {
        toast.success(`Subscribed to ${channel.username}`);
      } else {
        toast.success(`Unsubscribed from ${channel.username}`);
      }
    } catch (error) {
      setIsSubscribed(previousIsSubscribed);
      setSubscriberCount(previousSubscriberCount);
      toast.error("Failed to update subscription");
      console.error("Subscription error:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCoverUpdate = async (file: File) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to update cover");
      return;
    }

    setIsUpdatingCover(true);

    try {
      const updatedUser = await updateCoverImage(file);
      // Update channel state with new cover image
      setChannel((prev) => prev ? {
        ...prev,
        CoverImage: updatedUser.CoverImage
      } : null);
      toast.success("Cover image updated successfully");
    } catch (error) {
      toast.error("Failed to update cover image");
      console.error("Cover update error:", error);
    } finally {
      setIsUpdatingCover(false);
    }
  };

  const handleAvatarUpdate = async (file: File) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to update avatar");
      return;
    }

    setIsUpdatingAvatar(true);

    try {
      const updatedUser = await updateAvatar(file);
      // Update channel state with new avatar
      setChannel((prev) => prev ? {
        ...prev,
        avatar: updatedUser.avatar
      } : null);
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to update avatar");
      console.error("Avatar update error:", error);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  if (!username) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex pt-14">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <main className="p-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                <p className="text-muted-foreground">No channel specified</p>
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
              {/* Channel Header - Full Width */}
              {loading ? (
                <ChannelHeaderSkeleton />
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
              ) : channel ? (
                <>
                  <ChannelHeader
                    channel={channel}
                    isSubscribed={isSubscribed}
                    subscriberCount={subscriberCount}
                    onSubscribe={handleSubscribe}
                    isSubscribing={isSubscribing}
                    isOwnChannel={isOwnChannel}
                    onCoverUpdate={handleCoverUpdate}
                    onAvatarUpdate={handleAvatarUpdate}
                    isUpdatingCover={isUpdatingCover}
                    isUpdatingAvatar={isUpdatingAvatar}
                  />

                  {/* Tabs */}
                  <div className="max-w-6xl mx-auto">
                    <div className="border-b border-border px-4">
                      <div className="flex gap-6">
                        <button className="py-3 text-sm font-medium border-b-2 border-foreground text-foreground">
                          Videos
                        </button>
                        <button className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                          Playlists
                        </button>
                        <button className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                          About
                        </button>
                      </div>
                    </div>

                    {/* Videos Grid */}
                    <div className="p-4">
                      {videosLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array(8)
                            .fill(0)
                            .map((_, i) => (
                              <VideoCardSkeleton key={i} />
                            ))}
                        </div>
                      ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <p className="text-xl font-medium text-foreground mb-2">
                            No videos yet
                          </p>
                          <p className="text-muted-foreground">
                            {isOwnChannel
                              ? "Upload your first video to get started!"
                              : "This channel hasn't uploaded any videos yet."}
                          </p>
                          {isOwnChannel && (
                            <Link href="/upload" className="mt-4">
                              <Button>Upload a video</Button>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {videos.map((video) => (
                            <UserVideoCard 
                              key={video._id} 
                              video={video}
                              showChannel={false}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
