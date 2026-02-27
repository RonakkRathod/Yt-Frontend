import api from "@/lib/api";

export interface WatchHistoryVideo {
  _id: string;
  title: string;
  description?: string;
  thumbnail: {
    url: string;
    public_id?: string;
  } | string;
  videoFile: {
    url: string;
  };
  duration: number;
  views: number;
  createdAt: string;
  owner: {
    _id: string;
    fullName: string;
    username: string;
    avatar?: {
      url: string;
    } | string;
  };
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * Get user's watch history
 * @returns Promise with array of watched videos
 */
export async function getWatchHistory(): Promise<WatchHistoryVideo[]> {
  const response = await api.get<ApiResponse<WatchHistoryVideo[]>>(
    "/users/watch-history"
  );
  return response.data.data || [];
}

/**
 * Helper to get thumbnail URL (handles both string and object formats)
 */
export function getThumbnailUrl(thumbnail: WatchHistoryVideo["thumbnail"]): string {
  if (typeof thumbnail === "string") return thumbnail;
  return thumbnail?.url || "";
}

/**
 * Helper to get avatar URL (handles both string and object formats)
 */
export function getAvatarUrl(avatar: WatchHistoryVideo["owner"]["avatar"]): string {
  if (!avatar) return "";
  if (typeof avatar === "string") return avatar;
  return avatar?.url || "";
}
