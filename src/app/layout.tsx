import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ConditionalLayout from "@/components/layout/conditional-layout";
import { AuthProvider } from "@/contexts/auth-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { Toaster } from "@/components/ui/toaster";

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontSourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export const metadata: Metadata = {
  title: "TrustLance - Hire the best freelancers for any job, online.",
  description:
    "World's largest freelance marketplace. Any job you can possibly think of. Save up to 90% & get quotes for free. Pay only when you're 100% happy.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontInter.variable,
          fontSourceCodePro.variable
        )}
      >
        <AuthProvider>
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <ConditionalLayout>{children}</ConditionalLayout>
            </div>
            <Toaster />
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}