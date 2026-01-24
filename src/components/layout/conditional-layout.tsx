"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PublicLayout from "@/components/layout/public-layout";
import AuthLayout from "@/components/layout/auth-layout";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const isAuthPage = ["/login", "/signup", "/post-project"].includes(pathname);
  const isAuthenticatedRoute = [
    "/dashboard",
    "/profile",
    "/wallet",
    "/projects",
    "/browse",
    "/manage",
    "/messages",
    "/lists",
    "/tasklists",
    "/services",
    "/inbox",
    "/feedback",
    "/credit",
    "/project-updates",
    "/bookmarks",
    "/prototyper",
    "/disputes"
  ].some(route => pathname.startsWith(route));

  useEffect(() => {
    if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      router.push("/dashboard");
    }
    if (!isAuthenticated && isAuthenticatedRoute) {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router, isAuthenticatedRoute]);

  // Auth pages (login, signup, post-project) - no header/footer
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Authenticated routes - use AuthLayout
  if (isAuthenticatedRoute && isAuthenticated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  // Public routes - use PublicLayout
  return <PublicLayout>{children}</PublicLayout>;
}