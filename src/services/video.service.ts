import api from "@/lib/api";

export interface UserVideo {
  _id: string;
  title: string;
  description?: string;
  thumbnail: {
    url: string;
    public_id: string;
  };
  videoFile: {
    url: string;
    public_id: string;
  };
  duration: number;
  views: number;
  isPublished: boolean;
  owner: string;
  createdAt: string;
  updatedAt: string;
  ownerDetails?: {
    username: string;
    avatar?: { url: string };
  };
}

// Video details returned by getVideoById
export interface VideoDetails {
  _id: string;
  title: string;
  description?: string;
  videoFile: {
    url: string;
  };
  views: number;
  duration: number;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  owner: {
    _id: string;
    username: string;
    avatar?: { url: string };
    subscriberscount: number;
    isSubscribed: boolean;
  };
}

export interface UploadedVideo {
  _id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadVideoPayload {
  title: string;
  description?: string;
  thumbnail: File;
  video: File;
}

interface PaginatedResponse {
  docs: UserVideo[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// Upload a new video with thumbnail and file
export async function uploadVideo(payload: UploadVideoPayload): Promise<UploadedVideo> {
  const formData = new FormData();
  formData.append("title", payload.title);
  if (payload.description) {
    formData.append("description", payload.description);
  }
  formData.append("thumbnail", payload.thumbnail);
  formData.append("videoFile", payload.video);

  const response = await api.post<ApiResponse<UploadedVideo>>("/video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data;
}

// Fetch a single video by ID
export async function getVideoById(videoId: string): Promise<VideoDetails> {
  const response = await api.get<ApiResponse<VideoDetails>>(`/video/v/${videoId}`);
  return response.data.data;
}

// Fetch videos uploaded by a specific user
export async function getUserVideos(userId: string): Promise<UserVideo[]> {
  const response = await api.get<ApiResponse<PaginatedResponse>>(`/video?userId=${userId}`);
  return response.data.data.docs || [];
}

// Fetch all videos
export async function getAllVideos(limit: number = 10): Promise<UserVideo[]> {
  const response = await api.get<ApiResponse<PaginatedResponse>>(`/video?limit=${limit}`);
  return response.data.data.docs || [];
}