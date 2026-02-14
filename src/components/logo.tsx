import Link from "next/link";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const content = (
    <div className={cn(
      "flex items-center space-x-2 text-2xl font-bold tracking-tight",
      !asLink ? className : undefined
    )}>
      <Briefcase className="h-7 w-7 text-primary" />
      <span className="font-headline">
        Trust<span className="text-primary">L</span>ance
      </span>
    </div>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link href="/" className={className}>
      <div className="flex items-center space-x-2 text-2xl font-bold tracking-tight">
        <Briefcase className="h-7 w-7 text-primary" />
        <span className="font-headline">
          Trust<span className="text-primary">L</span>ance
        </span>
      </div>
    </Link>
  );
}
 