import api from "@/lib/api";

// Channel profile response from backend
export interface ChannelProfile {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: {
    url: string;
    public_id?: string;
  } | string;
  CoverImage?: {
    url: string;
    public_id?: string;
  } | string;
  subscriberesCount: number;
  channelSubscribedToCount: number;
  isSubscribed: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * Get channel profile by username
 * @param username - The username of the channel
 * @returns Promise with channel profile data
 */
export async function getChannelProfile(username: string): Promise<ChannelProfile> {
  const response = await api.get<ApiResponse<ChannelProfile>>(
    `/users/c/${username}`
  );
  return response.data.data;
}

/**
 * Get avatar URL from channel profile (handles both string and object formats)
 */
export function getAvatarUrl(avatar: ChannelProfile['avatar']): string {
  if (typeof avatar === 'string') {
    return avatar;
  }
  return avatar?.url || '';
}

/**
 * Get cover image URL from channel profile (handles both string and object formats)
 */
export function getCoverImageUrl(coverImage: ChannelProfile['CoverImage']): string {
  if (!coverImage) return '';
  if (typeof coverImage === 'string') {
    return coverImage;
  }
  return coverImage?.url || '';
}

/**
 * Update channel cover image
 * @param coverImage - The cover image file
 * @returns Promise with updated user data
 */
export async function updateCoverImage(coverImage: File): Promise<ChannelProfile> {
  const formData = new FormData();
  formData.append("CoverImage", coverImage);

  const response = await api.patch<ApiResponse<ChannelProfile>>(
    "/users/update-coverimage",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.data;
}

/**
 * Update channel avatar
 * @param avatar - The avatar image file
 * @returns Promise with updated user data
 */
export async function updateAvatar(avatar: File): Promise<ChannelProfile> {
  const formData = new FormData();
  formData.append("avatar", avatar);

  const response = await api.patch<ApiResponse<ChannelProfile>>(
    "/users/update-avatar",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data.data;
}
