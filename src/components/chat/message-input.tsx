'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { moderateChat } from '@/ai/flows/moderate-chat-flow';

interface MessageInputProps {
  chatId: string;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModerating, setIsModerating] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    setIsModerating(true);

    try {
      const moderationResult = await moderateChat({ message: newMessage });

      if (!moderationResult.isAppropriate) {
        toast({
          variant: 'destructive',
          title: 'Message Blocked',
          description: moderationResult.reason || 'Your message was deemed inappropriate.',
        });
        setIsModerating(false);
        return;
      }

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send message. Please try again.',
      });
    } finally {
      setIsModerating(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
      <Input
        type="text"
        placeholder={`Message #${chatId}`}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="flex-1 bg-background"
        autoComplete="off"
        disabled={isModerating}
      />
      <Button type="submit" size="icon" disabled={!newMessage.trim() || isModerating} aria-label="Send message">
        {isModerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      </Button>
    </form>
  );
}
