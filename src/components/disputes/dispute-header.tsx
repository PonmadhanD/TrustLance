'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Bell, 
  ChevronDown,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface DisputeHeaderProps {
  backUrl?: string;
  backLabel?: string;
}

export function DisputeHeader({ backUrl = '/projects', backLabel = 'Back to Project' }: DisputeHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Back Navigation */}
          <div className="flex items-center gap-4">
            <Link href={backUrl}>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">Dispute Resolution Center</h1>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs p-0 flex items-center justify-center">
                2
              </Badge>
            </Button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'JD'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user?.name || 'John Doe'}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link href={`/profile/${user?.username || 'johndoe'}`}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4 mr-3" />
                      View Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 