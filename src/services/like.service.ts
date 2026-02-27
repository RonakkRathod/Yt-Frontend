import api from "@/lib/api";

// Liked video response from backend
export interface LikedVideo {
  _id: string;
  title: string;
  description?: string;
  thumbnail: {
    url: string;
  };
  videoFile: {
    url: string;
  };
  duration: number;
  views: number;
  isPublished: boolean;
  owner: string;
  createdAt: string;
  ownerDetails: {
    username: string;
    fullName: string;
    avatar: {
      url: string;
    };
  };
}

interface ToggleLikeResponse {
  isLiked: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * Toggle like status for a video
 * @param videoId - The ID of the video to like/unlike
 * @returns Promise with the new like status
 */
export async function toggleVideoLike(videoId: string): Promise<ToggleLikeResponse> {
  const response = await api.post<ApiResponse<ToggleLikeResponse>>(
    `/likes/toggle/v/${videoId}`
  );
  return response.data.data;
}

/**
 * Toggle like status for a comment
 * @param commentId - The ID of the comment to like/unlike
 * @returns Promise with the new like status
 */
export async function toggleCommentLike(commentId: string): Promise<ToggleLikeResponse> {
  const response = await api.post<ApiResponse<ToggleLikeResponse>>(
    `/likes/toggle/c/${commentId}`
  );
  return response.data.data;
}

/**
 * Toggle like status for a tweet
 * @param tweetId - The ID of the tweet to like/unlike
 * @returns Promise with the new like status
 */
export async function toggleTweetLike(tweetId: string): Promise<ToggleLikeResponse> {
  const response = await api.post<ApiResponse<ToggleLikeResponse>>(
    `/likes/toggle/t/${tweetId}`
  );
  return response.data.data;
}

/**
 * Get all liked videos for the authenticated user
 * @returns Promise with array of liked videos
 */
export async function getLikedVideos(): Promise<LikedVideo[]> {
  const response = await api.get<ApiResponse<{ likedVideo: LikedVideo }[]>>(
    "/likes/videos"
  );
  // Backend returns array of objects with likedVideo property
  return response.data.data.map((item) => item.likedVideo);
}
