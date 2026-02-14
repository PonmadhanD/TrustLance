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
    <html lang="en" suppressHydrationWarning>
      <head />

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