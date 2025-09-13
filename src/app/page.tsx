'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Chat {
    id: string;
    name: string;
    type: 'channel' | 'dm';
}

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeChat, setActiveChat] = useState<Chat | null>({ id: 'general', name: 'General', type: 'channel' });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    const handleSetActiveChat = async (chat: Chat) => {
        if (chat.type === 'dm') {
            const chatDoc = await getDoc(doc(db, 'chats', chat.id));
            if (chatDoc.exists()) {
                const chatData = chatDoc.data();
                const otherUserId = chatData.users.find((uid: string) => uid !== user?.uid);
                if (otherUserId) {
                    const userDoc = await getDoc(doc(db, 'users', otherUserId));
                    if (userDoc.exists()) {
                        setActiveChat({ ...chat, name: userDoc.data().displayName });
                    }
                } else {
                     // This is a chat with myself
                     setActiveChat({ ...chat, name: user?.displayName || 'Myself' });
                }
            }
        } else {
            setActiveChat(chat);
        }
    }


    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <SidebarProvider defaultOpen>
            <div className="flex h-screen w-full bg-background">
                <Sidebar>
                    <ChatSidebar activeChat={activeChat} setActiveChat={handleSetActiveChat} />
                </Sidebar>
                <SidebarInset className="flex flex-col h-screen">
                    <ChatHeader chatName={activeChat?.name ?? ''} isDirectMessage={activeChat?.type === 'dm'} />
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {activeChat && <MessageList chatId={activeChat.id} />}
                    </div>
                    {activeChat && <div className="p-4 md:p-6 border-t bg-card">
                        <MessageInput chatId={activeChat.id} chatName={activeChat.name} isDirectMessage={activeChat.type === 'dm'} />
                    </div>}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
