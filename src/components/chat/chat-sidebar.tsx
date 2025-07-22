'use client';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, MessagesSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatSidebarProps {
  activeChat: string;
  setActiveChat: (chatId: string) => void;
}

export function ChatSidebar({ activeChat, setActiveChat }: ChatSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const chats = [{ id: 'general', name: 'General' }];

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessagesSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Firebase Chat</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                onClick={() => setActiveChat(chat.id)}
                isActive={activeChat === chat.id}
              >
                # {chat.name}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        {user && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">{user.displayName}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </div>
  );
}
