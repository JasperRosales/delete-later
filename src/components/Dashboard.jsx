import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Suspense, lazy } from "react";

// Lazy load all panels to improve initial load time
const HomePanel = lazy(() => import("./panels/HomePanel"));
const AnalyticsPanel = lazy(() => import("./panels/AnalyticsPanel"));
const DataPanel = lazy(() => import("./panels/DataPanel"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10 px-4">
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none"></div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <Suspense fallback={<LoadingFallback />}>
            <HomePanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<LoadingFallback />}>
            <AnalyticsPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="data">
          <Suspense fallback={<LoadingFallback />}>
            <DataPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

