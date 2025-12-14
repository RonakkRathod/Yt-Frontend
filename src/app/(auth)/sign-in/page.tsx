"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await signIn({
        email: values.email,
        password: values.password,
      });
      
      toast.success("Welcome back!", {
        description: `Signed in as ${response.data.user.username}`,
      });
      
      router.replace("/");
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Login failed";
      setError(errMessage);
      toast.error(errMessage);
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
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-300">Email</FormLabel>
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
                    <FormLabel className="text-neutral-300">Password</FormLabel>
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
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center pt-0">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#FF0000] hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
