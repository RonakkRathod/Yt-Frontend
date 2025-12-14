"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: SignUpFormValues) => {
    setError(null);
    
    if (!avatar) {
      setError("Please upload an avatar");
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUp({
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
        avatar: avatar,
      });

      toast.success("Account created!", {
        description: `Welcome, ${response.data.user.username}!`,
      });

      router.replace("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-neutral-950">
     
      {/* YouTube background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/youtube-bg.jpg')",
          opacity: 0.35,
        }}
      />
      
      {/* Red glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
       
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/50" />
     
      
      <Card className="w-full max-w-sm bg-neutral-900/95 border-red-900/30 relative z-10 shadow-2xl shadow-red-900/20">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-1 mb-4">
            <div className="bg-[#FF0000] text-white font-bold px-2 py-1 rounded">
              You
            </div>
            <span className="text-white font-bold text-xl">Tube</span>
          </div>
          <CardTitle className="text-2xl font-bold text-[#FF0000]">
            Sign Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              {/* Avatar Upload */}
              <div className="space-y-1">
                <Label className="text-neutral-300 text-sm">Avatar *</Label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-600 overflow-hidden cursor-pointer hover:border-[#FF0000] flex items-center justify-center bg-neutral-800"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-neutral-500 text-xs">Upload</span>
                    )}
                  </div>
                  <span className="text-neutral-500 text-xs">
                    Click to select image
                  </span>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Upload avatar"
                />
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300 text-sm">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300 text-sm">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300 text-sm">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300 text-sm">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300 text-sm">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Error display */}
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center pt-0">
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#FF0000] hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
