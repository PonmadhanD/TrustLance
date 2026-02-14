'use client';

import { DisputeHeader } from '@/components/disputes/dispute-header';

interface DisputeLayoutProps {
  children: React.ReactNode;
  backUrl?: string;
  backLabel?: string;
}

export function DisputeLayout({ children, backUrl, backLabel }: DisputeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DisputeHeader backUrl={backUrl} backLabel={backLabel} />
      <main className="pb-8">
        {children}
      </main>
      
      {/* Compliance Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <span className="mr-2">⚠️</span>
            AI provides guidance only. Final decisions are made by human moderators.
          </div>
        </div>
      </footer>
    </div>
  );
} 