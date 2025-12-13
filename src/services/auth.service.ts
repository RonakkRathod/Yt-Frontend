import api from "@/lib/api";

// Types for auth
export interface SignUpData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  avatar?: File;
  coverImage?: File;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  watchHistory: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  statusCode: number;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}

// Auth service functions
export const authService = {
  // Sign up / Register
  async signUp(data: SignUpData): Promise<AuthResponse> {
    // Use FormData for file uploads (avatar, coverImage)
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    
    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }
    if (data.coverImage) {
      formData.append("coverImage", data.coverImage);
    }

    const response = await api.post<AuthResponse>("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Store access token
    if (response.data.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
    }

    return response.data;
  },

  // Sign in / Login
  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/users/login", data);

    // Store access token
    if (response.data.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
    }

    return response.data;
  },

  // Sign out / Logout
  async signOut(): Promise<void> {
    try {
      await api.post("/users/logout");
    } finally {
      localStorage.removeItem("accessToken");
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ data: User }>("/users/current-user");
      return response.data.data;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  },

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post("/users/change-password", { oldPassword, newPassword });
  },

  // Update account details
  async updateAccount(data: { fullName?: string; email?: string }): Promise<User> {
    const response = await api.patch<{ data: User }>("/users/update-account", data);
    return response.data.data;
  },

  // Update avatar
  async updateAvatar(avatar: File): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", avatar);
    
    const response = await api.patch<{ data: User }>("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Update cover image
  async updateCoverImage(coverImage: File): Promise<User> {
    const formData = new FormData();
    formData.append("coverImage", coverImage);
    
    const response = await api.patch<{ data: User }>("/users/cover-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },
};

export default authService;
