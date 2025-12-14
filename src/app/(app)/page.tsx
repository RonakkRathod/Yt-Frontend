import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex pt-14">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <main className="p-6">
              <h1 className="text-2xl font-semibold text-foreground mb-4">
                Home
              </h1>
              <div className="text-center text-muted-foreground py-20">
                <p className="text-lg">Your video feed will appear here</p>
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
