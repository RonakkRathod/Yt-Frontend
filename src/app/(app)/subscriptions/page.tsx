"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getSubscribedChannels, SubscribedChannel, toggleSubscription } from "@/services/subscription.service";
import { Skeleton } from "@/components/ui/skeleton";
import { MdSubscriptions } from "react-icons/md";
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

function ChannelCard({ 
  channel, 
  onUnsubscribe 
}: { 
  channel: SubscribedChannel; 
  onUnsubscribe: (channelId: string) => void;
}) {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleUnsubscribe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsUnsubscribing(true);
    try {
      await toggleSubscription(channel._id);
      onUnsubscribe(channel._id);
      toast.success(`Unsubscribed from ${channel.username}`);
    } catch (error) {
      toast.error("Failed to unsubscribe");
      console.error(error);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:bg-secondary/30 transition-colors">
      {/* Channel Avatar */}
      <Link href={`/channel/${channel._id}`} className="flex items-center gap-4 flex-1">
        <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden shrink-0">
          {channel.avatar?.url && (
            <img
              src={channel.avatar.url}
              alt={channel.username}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground">{channel.username}</h3>
          <p className="text-sm text-muted-foreground">{channel.fullName}</p>
          <p className="text-xs text-muted-foreground">
            {channel.subscribersCount?.toLocaleString() || 0} subscribers
          </p>
        </div>
      </Link>

      {/* Unsubscribe Button */}
      <div className="flex items-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUnsubscribe}
          disabled={isUnsubscribing}
          className="rounded-full"
        >
          {isUnsubscribing ? "..." : "Subscribed"}
        </Button>
      </div>

      {/* Latest Video (if available) */}
      {channel.latestVideo && (
        <Link
          href={`/watch/${channel.latestVideo._id}`}
          className="flex gap-3 group sm:w-80 shrink-0"
        >
          <div className="relative w-32 shrink-0">
            <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
              <img
                src={channel.latestVideo.thumbnail?.url}
                alt={channel.latestVideo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(channel.latestVideo.duration)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {channel.latestVideo.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {formatViews(channel.latestVideo.views)} • {formatTimeAgo(channel.latestVideo.createdAt)}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}

function ChannelSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
      <div className="flex gap-3 sm:w-80">
        <Skeleton className="w-32 aspect-video rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [channels, setChannels] = useState<SubscribedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Redirect to sign in if not authenticated
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to view subscriptions");
      router.push("/sign-in");
      return;
    }

    // Fetch subscribed channels
    getSubscribedChannels(user._id)
      .then((data) => {
        setChannels(data);
      })
      .catch((err) => {
        console.error("Failed to fetch subscriptions:", err);
        setError(err.message || "Failed to load subscriptions");
        toast.error("Failed to load subscriptions");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, authLoading, user, router]);

  const handleUnsubscribe = (channelId: string) => {
    setChannels((prev) => prev.filter((ch) => ch._id !== channelId));
  };

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
                <div className="space-y-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <ChannelSkeleton key={i} />
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
            <main className="w-full flex justify-center">
              <div className="w-full max-w-5xl p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <MdSubscriptions className="text-2xl text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
                    <p className="text-sm text-muted-foreground">
                      {channels.length} {channels.length === 1 ? "channel" : "channels"}
                    </p>
                  </div>
                </div>

                {/* Channel List */}
                {loading ? (
                  <div className="space-y-2">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <ChannelSkeleton key={i} />
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
                ) : channels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <MdSubscriptions className="text-6xl text-muted-foreground mb-4" />
                    <h2 className="text-xl font-medium text-foreground mb-2">
                      No subscriptions yet
                    </h2>
                    <p className="text-muted-foreground text-center max-w-md">
                      Channels you subscribe to will appear here. Start exploring
                      and subscribe to creators you enjoy!
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
                    {channels.map((channel) => (
                      <ChannelCard 
                        key={channel._id} 
                        channel={channel}
                        onUnsubscribe={handleUnsubscribe}
                      />
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
