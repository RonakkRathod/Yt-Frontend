"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadVideo } from "@/services/video.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    return () => {
      if (thumbPreview) {
        URL.revokeObjectURL(thumbPreview);
      }
    };
  }, [thumbPreview]);

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbPreview(previewUrl);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!thumbnail || !videoFile) {
      toast.error("Thumbnail and video files are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadVideo({
        title: title.trim(),
        description: description.trim(),
        thumbnail,
        video: videoFile,
      });

      toast.success("Video uploaded successfully");
      router.replace("/studio"); // after successful upload, redirect to studio page
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload video";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableForm = isSubmitting || (!isLoading && !isAuthenticated);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <main className="p-6 min-h-[calc(100vh-3.5rem)]">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">
                  Upload video
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Share your video with the world
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h2 className="text-lg font-medium text-foreground mb-4">Details</h2>
                      
                      {/* Title */}
                      <div className="space-y-2 mb-4">
                        <label className="text-sm font-medium text-foreground">
                          Title (required)
                        </label>
                        <Input
                          type="text"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Add a title that describes your video"
                          disabled={disableForm}
                          className="h-10"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          placeholder="Tell viewers about your video"
                          disabled={disableForm}
                          rows={6}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        />
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="p-6 rounded-lg border border-border bg-card">
                      <h2 className="text-lg font-medium text-foreground mb-2">Thumbnail</h2>
                      <p className="text-xs text-muted-foreground mb-4">
                        Select or upload a picture that shows what&apos;s in your video.
                      </p>
                      <label className="flex flex-col items-center justify-center w-full h-44 border border-dashed border-muted-foreground/50 rounded-lg cursor-pointer hover:border-foreground hover:bg-secondary/30 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailChange}
                          disabled={disableForm}
                        />
                        {thumbPreview ? (
                          <img
                            src={thumbPreview}
                            alt="Thumbnail"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <svg className="w-8 h-8 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-muted-foreground">Upload thumbnail</p>
                          </div>
                        )}
                      </label>
                      {thumbnail && (
                        <p className="text-xs text-muted-foreground mt-2">{thumbnail.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Video Upload */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border border-border bg-card h-full flex flex-col">
                      <h2 className="text-lg font-medium text-foreground mb-4">Video file</h2>
                      <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-muted-foreground/50 rounded-lg cursor-pointer hover:border-foreground hover:bg-secondary/30 transition-colors min-h-80">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoChange}
                          disabled={disableForm}
                        />
                        {videoFile ? (
                          <div className="text-center p-6">
                            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-base font-medium text-foreground mb-1">{videoFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">Click to change</p>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-base font-medium text-foreground mb-1">
                              Select video to upload
                            </p>
                            <p className="text-sm text-muted-foreground">
                              or drag and drop a file
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                              MP4, WebM or Ogg
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button type="submit" disabled={disableForm}>
                    {isSubmitting ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
