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

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeChat, setActiveChat] = useState('general');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

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
                    <ChatSidebar activeChat={active.id} setActiveChat={setActiveChat} />
                </Sidebar>
                <SidebarInset className="flex flex-col h-screen">
                    <ChatHeader chatName={activeChat} />
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        <MessageList chatId={activeChat} />
                    </div>
                    <div className="p-4 md:p-6 border-t bg-card">
                        <MessageInput chatId={activeChat} />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
