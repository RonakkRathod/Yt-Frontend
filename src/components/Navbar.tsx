"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AiFillYoutube } from "react-icons/ai";
import { FiSearch, FiUser, FiMoon, FiSun, FiMenu } from "react-icons/fi";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { IoMdNotificationsOutline, IoMdMic } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";
import { Button } from "@/components/ui/button";
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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
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
          <Link href="/" className="flex items-center gap-1 hover:bg-secondary/50 px-2 py-2 rounded-lg transition-colors">
            <AiFillYoutube className="text-red-600 text-4xl" />
            <span className="text-xl font-semibold text-foreground hidden sm:block tracking-tighter">
              YouTube
            </span>
          </Link>
        </div>

        {/* Middle: Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden sm:flex items-center justify-center gap-3">
          <div className={`flex items-center flex-1 max-w-xl border rounded-full overflow-hidden transition-all duration-200 ${
            isFocused 
              ? "border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]" 
              : "border-border hover:border-border/80"
          }`}>
            {/* Search Icon (shows when focused) */}
            {isFocused && (
              <div className="pl-4 pr-2">
                <FiSearch className="text-lg text-muted-foreground" />
              </div>
            )}
            
            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`flex-1 bg-transparent h-10 text-foreground placeholder:text-muted-foreground outline-none text-base ${
                isFocused ? "pl-0" : "pl-4"
              } pr-2`}
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="pr-3 hover:opacity-70 transition-opacity"
                title="Clear search"
                aria-label="Clear search"
              >
                <IoCloseCircle className="text-xl text-muted-foreground" />
              </button>
            )}
            
            {/* Search Button */}
            <button
              type="submit"
              className="h-10 px-5 bg-secondary hover:bg-secondary/80 border-l border-border transition-colors"
              title="Search"
              aria-label="Search"
            >
              <FiSearch className="text-xl text-foreground" />
            </button>
          </div>
          
          {/* Microphone Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full bg-secondary hover:bg-secondary/80 h-10 w-10"
            title="Search with your voice"
          >
            <IoMdMic className="text-xl text-foreground" />
          </Button>
        </form>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden rounded-full hover:bg-secondary"
          onClick={() => router.push("/search")}
        >
          <FiSearch className="text-xl text-foreground" />
        </Button>

        {/* Right: User Actions */}
        <div className="flex items-center gap-1">
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