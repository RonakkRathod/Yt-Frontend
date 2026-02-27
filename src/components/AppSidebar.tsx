"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiFillHome, AiFillFire } from "react-icons/ai";
import { MdHistory, MdSubscriptions, MdVideoLibrary, MdWatchLater, MdThumbUp, MdOutlineVideoLibrary } from "react-icons/md";
import { SiYoutubeshorts } from "react-icons/si";
import { BiSolidVideos } from "react-icons/bi";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const mainMenuItems = [
  {
    icon: AiFillHome,
    label: "Home",
    href: "/",
  },
  {
    icon: SiYoutubeshorts,
    label: "Shorts",
    href: "/shorts",
  },
  {
    icon: MdSubscriptions,
    label: "Subscriptions",
    href: "/subscriptions",
  },
];

const libraryMenuItems = [
  {
    icon: MdVideoLibrary,
    label: "Library",
    href: "/library",
  },
  {
    icon: MdHistory,
    label: "History",
    href: "/history",
  },
  {
    icon: BiSolidVideos,
    label: "Your videos",
    href: "/studio",
    requireAuth: true,
  },
  {
    icon: MdWatchLater,
    label: "Watch Later",
    href: "/playlist/watch-later",
  },
  {
    icon: MdThumbUp,
    label: "Liked videos",
    href: "/playlist/liked",
  },
  {
    icon: MdOutlineVideoLibrary,
    label: "Playlists",
    href: "/playlists",
  },
];

const exploreMenuItems = [
  {
    icon: AiFillFire,
    label: "Trending",
    href: "/trending",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const renderMenuItem = (item: { icon: React.ComponentType<{ className?: string }>, label: string, href: string, requireAuth?: boolean }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;

    return (
      <SidebarMenuItem key={item.href} className="list-none px-2">
        <Link 
          href={item.href} 
          className={`flex items-center gap-5 px-3 py-2 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 ${
            isActive 
              ? "bg-neutral-200 dark:bg-neutral-800" 
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
          }`}
        >
          <Icon className={`text-[22px] shrink-0 ${isActive ? "text-foreground" : "text-foreground/80"}`} />
          <span className={`text-sm group-data-[collapsible=icon]:hidden ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
            {item.label}
          </span>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-0" collapsible="icon">
      <SidebarContent className="bg-background gap-0">
        {/* Main Menu */}
        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="px-3 text-base font-semibold text-foreground mb-1 group-data-[collapsible=icon]:hidden">
            
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {mainMenuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-border group-data-[collapsible=icon]:hidden" />

        {/* Library Section */}
        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="px-3 text-base font-semibold text-foreground mb-1 group-data-[collapsible=icon]:hidden">
            You
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {libraryMenuItems.map((item) => {
                if (item.requireAuth && !isAuthenticated) return null;
                return renderMenuItem(item);
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-border group-data-[collapsible=icon]:hidden" />

        {/* Explore Section */}
        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="px-3 text-base font-semibold text-foreground mb-1 group-data-[collapsible=icon]:hidden">
            Explore
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {exploreMenuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
