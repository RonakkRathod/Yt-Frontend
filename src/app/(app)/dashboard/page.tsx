"use client";
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardPage() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <main className="p-6">
              <h1 className="text-2xl font-semibold text-foreground mb-6">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome to your dashboard.
              </p>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
