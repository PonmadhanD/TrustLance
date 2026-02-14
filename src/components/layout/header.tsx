"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import dynamic from 'next/dynamic';

const MegaMenu = dynamic(() => import('@/components/layout/mega-menu'), {
  ssr: false, // Client-side only to save server hydration time
  loading: () => null // No loader needed as it appears on hover
});

export default function Header({ className }: { className?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  console.log("Header rendering (v2), user:", user?.id);
  // State for mega menu
  const [activeMegaMenu, setActiveMegaMenu] = useState<'hire' | 'work' | 'solutions' | null>(null);

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm", className)}>
      <div className="flex h-[70px] items-center px-10 max-w-[1440px] mx-auto w-full">
        <div className="mr-8">
          <Link href="/">
            <Logo asLink={false} />
          </Link>
        </div>

        <nav className="flex items-center h-full space-x-1">
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMegaMenu('hire')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Button variant="ghost" className="h-[70px] rounded-none px-4 text-gray-700 hover:text-blue-600 hover:bg-transparent font-medium">
              Hire Freelancers
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            {activeMegaMenu === 'hire' && (
              <MegaMenu
                isOpen={true}
                onClose={() => setActiveMegaMenu(null)}
                type="hire"
              />
            )}
          </div>

          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMegaMenu('work')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Button
              variant="ghost"
              className="h-[70px] rounded-none px-4 text-gray-700 hover:text-blue-600 hover:bg-transparent font-medium"
              onClick={() => window.location.href = '/find-jobs'}
            >
              Find Work
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            {activeMegaMenu === 'work' && (
              <MegaMenu
                isOpen={true}
                onClose={() => setActiveMegaMenu(null)}
                type="work"
              />
            )}
          </div>

          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setActiveMegaMenu('solutions')}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <Button variant="ghost" className="h-[70px] rounded-none px-4 text-gray-700 hover:text-blue-600 hover:bg-transparent font-medium">
              Solutions
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            {activeMegaMenu === 'solutions' && (
              <MegaMenu
                isOpen={true}
                onClose={() => setActiveMegaMenu(null)}
                type="solutions"
              />
            )}
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button asChild variant="ghost" className="text-gray-700 font-medium hover:text-blue-600 hover:bg-transparent hidden md:inline-flex">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="ghost" className="text-gray-700 font-medium hover:text-blue-600 hover:bg-transparent hidden md:inline-flex">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild className="bg-[#4F46E5] hover:bg-[#4338ca] text-white font-semibold rounded-lg px-6 h-10 shadow-sm transition-all hover:translate-y-[-1px] hover:shadow-md">
            <Link href="/post-project">Post a Project</Link>
          </Button>
        </div>
      </div>
    </header>
  );
} 