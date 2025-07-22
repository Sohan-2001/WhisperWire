'use client';

import { useState } from 'react';
import { type Message } from './message-list';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Save, XCircle } from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  chatId: string;
}

export function ChatMessage({ message, isCurrentUser, chatId }: ChatMessageProps) {
  const getInitials = (name?: string | null) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [isHovered, setIsHovered] = useState(false);
  
  const messageDate = message.createdAt?.toDate();

  const handleUpdateMessage = async () => {
    if (editedText.trim() === '') return;
    const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
    try {
      await updateDoc(messageRef, {
        text: editedText,
      });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Message updated successfully.',
      });
    } catch (error) {
      console.error("Error updating message: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update message.',
      });
    }
  };

  const handleDeleteMessage = async () => {
    const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
    try {
      await deleteDoc(messageRef);
      toast({
        title: 'Success',
        description: 'Message deleted successfully.',
      });
    } catch (error) {
      console.error("Error deleting message: ", error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete message.',
      });
    }
  };


  return (
    <div 
      className={cn('flex items-end gap-3 group/message', isCurrentUser && 'justify-end')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.photoURL ?? undefined} alt={message.displayName ?? 'User'} />
          <AvatarFallback>{getInitials(message.displayName)}</AvatarFallback>
        </Avatar>
      )}
      
      {isCurrentUser && (
        <div className={cn(
          "flex items-center opacity-0 transition-opacity duration-300",
          (isHovered || isEditing) && "opacity-100",
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Message options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    <span className="text-destructive">Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your message.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div
        className={cn(
          'relative max-w-sm md:max-w-md rounded-xl px-4 py-2 transition-all duration-300',
          isCurrentUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none shadow-sm'
        )}
      >
        {!isCurrentUser && (
          <p className="text-xs font-semibold mb-1 text-primary">{message.displayName}</p>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="h-8 bg-background/80 text-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateMessage();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleUpdateMessage}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm">{message.text}</p>
            <div className="absolute -bottom-5 text-xs text-muted-foreground opacity-0 group-hover/message:opacity-100 transition-opacity duration-300"
              style={isCurrentUser ? { right: 0 } : { left: 0 }}>
              {messageDate && new Intl.DateTimeFormat('default', { hour: 'numeric', minute: 'numeric' }).format(messageDate)}
            </div>
          </>
        )}
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
