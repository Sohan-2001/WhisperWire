'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Hash, AtSign } from 'lucide-react';

interface ChatHeaderProps {
  chatName: string;
  isDirectMessage?: boolean;
}

export function ChatHeader({ chatName, isDirectMessage = false }: ChatHeaderProps) {
  return (
    <header className="flex items-center h-16 px-4 md:px-6 border-b bg-card shrink-0">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-3">
        {isDirectMessage ? (
          <AtSign className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Hash className="h-5 w-5 text-muted-foreground" />
        )}
        <span className="text-lg font-semibold">{chatName}</span>
      </div>
    </header>
  );
}
