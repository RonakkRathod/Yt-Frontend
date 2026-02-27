import api from "@/lib/api";

// Subscriber details
export interface Subscriber {
  _id: string;
  username: string;
  fullName: string;
  avatar?: {
    url: string;
  };
  subscribedTosubscriber: boolean;
  subscribersCount: number;
}

// Subscribed channel details
export interface SubscribedChannel {
  _id: string;
  username: string;
  fullName: string;
  avatar?: {
    url: string;
  };
  latestVideo?: {
    _id: string;
    videoFile: {
      url: string;
    };
    thumbnail: {
      url: string;
    };
    title: string;
    description: string;
    duration: number;
    createdAt: string;
    views: number;
  };
  subscribersCount: number;
}

interface ToggleSubscriptionResponse {
  subscribed?: boolean;
  isSubscribed?: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * Toggle subscription to a channel
 * @param channelId - The ID of the channel to subscribe/unsubscribe
 * @returns Promise with the new subscription status
 */
export async function toggleSubscription(channelId: string): Promise<boolean> {
  const response = await api.post<ApiResponse<ToggleSubscriptionResponse>>(
    `/subscriptions/c/${channelId}`
  );
  // Backend returns either { subscribed: false } or { isSubscribed: true }
  return response.data.data.isSubscribed ?? response.data.data.subscribed ?? false;
}

/**
 * Get subscribers of a channel
 * @param channelId - The ID of the channel
 * @returns Promise with array of subscribers
 */
export async function getChannelSubscribers(channelId: string): Promise<Subscriber[]> {
  const response = await api.get<ApiResponse<{ subscriber: Subscriber }[]>>(
    `/subscriptions/c/${channelId}`
  );
  return response.data.data.map((item) => item.subscriber);
}

/**
 * Get channels that a user has subscribed to
 * @param userId - The ID of the user
 * @returns Promise with array of subscribed channels
 */
export async function getSubscribedChannels(userId: string): Promise<SubscribedChannel[]> {
  const response = await api.get<ApiResponse<{ subscribedChannel: SubscribedChannel }[]>>(
    `/subscriptions/u/${userId}`
  );
  return response.data.data.map((item) => item.subscribedChannel);
}
