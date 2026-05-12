import type { ReactNode } from "react";

import { ConvexClientProvider } from "@/components/convex-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
