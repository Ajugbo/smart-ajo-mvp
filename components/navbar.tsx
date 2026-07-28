'use client';

import { useSession } from '@/lib/session';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const { name, role, clearSession } = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    clearSession();
    router.push('/signin');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Smart Ajo
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {name && (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium leading-none">{name}</p>
                <p className="text-xs text-muted-foreground capitalize">{role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
