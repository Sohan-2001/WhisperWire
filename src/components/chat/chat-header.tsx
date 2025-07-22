'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';

interface ChatHeaderProps {
  chatName: string;
}

export function ChatHeader({ chatName }: ChatHeaderProps) {
  return (
    <header className="flex items-center h-16 px-4 md:px-6 border-b bg-card">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold"># {chatName}</span>
      </div>
    </header>
  );
}
