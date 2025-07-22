'use client';

import { type Message } from './message-list';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const getInitials = (name?: string | null) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  const messageDate = message.createdAt?.toDate();

  return (
    <div className={cn('flex items-end gap-3', isCurrentUser && 'justify-end')}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.photoURL ?? undefined} alt={message.displayName ?? 'User'} />
          <AvatarFallback>{getInitials(message.displayName)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'group relative max-w-sm md:max-w-md rounded-xl px-4 py-2 transition-all duration-300',
          isCurrentUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none shadow-sm'
        )}
      >
        {!isCurrentUser && (
          <p className="text-xs font-semibold mb-1 text-primary">{message.displayName}</p>
        )}
        <p className="text-sm">{message.text}</p>
        <div className="absolute -bottom-5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={isCurrentUser ? { right: 0 } : { left: 0 }}>
          {messageDate && new Intl.DateTimeFormat('default', { hour: 'numeric', minute: 'numeric' }).format(messageDate)}
        </div>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.photoURL ?? undefined} alt={message.displayName ?? 'User'} />
          <AvatarFallback>{getInitials(message.displayName)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
