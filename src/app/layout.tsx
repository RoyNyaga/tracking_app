import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Wide Load Logistics | Smart Cargo Tracking",
  description: "Wide Load Logistics connects supply chains worldwide. Real-time multi-package tracking, state-of-the-art warehousing, and optimized freight paths.",
  icons: {
    icon: "/tab-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}

