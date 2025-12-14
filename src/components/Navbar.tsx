"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AiFillYoutube } from "react-icons/ai";
import { FiSearch, FiUser, FiMoon, FiSun, FiMenu } from "react-icons/fi";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-60 bg-background">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Menu Toggle & Logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full hover:bg-secondary z-70"
          >
            <FiMenu className="text-2xl text-foreground" />
          </Button>
          <Link href="/" className="flex items-center gap-2 hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors">
            <AiFillYoutube className="text-red-600 text-4xl" />
            <span className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
              YouTube
            </span>
          </Link>
        </div>

        {/* Middle: Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
          <div className="flex items-center gap-0 max-w-150 mx-auto rounded-full overflow-hidden bg-secondary/40 hover:bg-secondary/60 focus-within:bg-secondary/80 transition-all duration-300 ease-in-out shadow-sm">
            <div className="flex-1 flex items-center bg-transparent">
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 outline-none bg-transparent px-5 h-10 text-foreground placeholder:text-muted-foreground/60 shadow-none"
              />
            </div>
            <Button
              type="submit"
              variant="ghost"
              className="h-10 w-16 hover:bg-secondary/20 rounded-none transition-all duration-300"
            >
              <FiSearch className="text-xl text-foreground/80" />
            </Button>
          </div>
        </form>

        {/* Right: User Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-secondary"
          >
            {mounted && theme === "dark" ? (
              <FiSun className="text-xl text-muted-foreground" />
            ) : (
              <FiMoon className="text-xl text-muted-foreground" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              {/* Upload Video Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex rounded-full hover:bg-secondary"
                onClick={() => router.push("/upload")}
              >
                <HiOutlineVideoCamera className="text-2xl text-foreground" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex rounded-full hover:bg-secondary relative"
              >
                <IoMdNotificationsOutline className="text-2xl text-foreground" />
              </Button>

              {/* User Avatar/Profile */}
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/channel/${user.username}`)}
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-secondary"
                    onClick={() => router.push(`/channel/${user?.username}`)}
                  >
                    <FiUser className="text-xl text-foreground" />
                  </Button>
                )}

                {/* Sign Out Button */}
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <Button
                onClick={() => router.push("/sign-in")}
                className="flex items-center gap-2 bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 dark:hover:bg-blue-600/20 rounded-full px-4"
              >
                <FiUser className="text-lg" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;