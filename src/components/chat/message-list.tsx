
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatMessage } from '@/components/chat/chat-message';
import { Separator } from '@/components/ui/separator';

export interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
}

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, today)) {
        return 'Today';
    } else if (isSameDay(date, yesterday)) {
        return 'Yesterday';
    } else {
        return new Intl.DateTimeFormat('default', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-4 justify-end">
          <div className="space-y-2 text-right">
            <Skeleton className="h-4 w-[250px] ml-auto" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={scrollRef}>
      {messages.map((message, index) => {
        const messageDate = message.createdAt?.toDate();
        const prevMessageDate = index > 0 ? messages[index - 1].createdAt?.toDate() : null;

        const showDateSeparator = messageDate && (!prevMessageDate || !isSameDay(messageDate, prevMessageDate));
        
        return (
            <React.Fragment key={message.id}>
              {showDateSeparator && (
                <div className="relative py-4">
                    <Separator />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="px-2 bg-background text-sm text-muted-foreground">
                            {formatDateSeparator(messageDate)}
                        </span>
                    </div>
                </div>
              )}
              <ChatMessage
                message={message}
                isCurrentUser={message.uid === user?.uid}
                chatId={chatId}
              />
            </React.Fragment>
        )
      })}
    </div>
  );
}
