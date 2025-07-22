'use client';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, MessagesSquare, Search, AtSign, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type Chat } from '@/app/page';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { ScrollArea } from '../ui/scroll-area';

interface ChatSidebarProps {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
}

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export function ChatSidebar({ activeChat, setActiveChat }: ChatSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dms, setDms] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) return;
    const usersCollection = collection(db, 'users');
    getDocs(usersCollection).then((snapshot) => {
      const userList = snapshot.docs
        .map((doc) => doc.data() as User)
        .filter((u) => u.uid !== user.uid);
      setUsers(userList);
      setFilteredUsers(userList);
    });
    
    const dmsQuery = query(collection(db, 'chats'), where('users', 'array-contains', user.uid), where('type', '==', 'dm'));
    const unsubscribe = onSnapshot(dmsQuery, async (snapshot) => {
        const dmList: Chat[] = [];
        for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            const otherUserId = chatData.users.find((uid: string) => uid !== user.uid);
            
            if (otherUserId) {
                const userDoc = await getDoc(doc(db, 'users', otherUserId));
                if (userDoc.exists()) {
                    dmList.push({ id: chatDoc.id, name: userDoc.data().displayName, type: 'dm' });
                }
            } else { // DM with myself
                 dmList.push({ id: chatDoc.id, name: user.displayName || 'Myself', type: 'dm' });
            }
        }
        setDms(dmList);
    });

    return () => unsubscribe();

  }, [user]);

  useEffect(() => {
    if (search === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((u) =>
          u.displayName.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, users]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const createOrOpenDm = async (targetUser: User) => {
    if (!user) return;
    const chatId = user.uid > targetUser.uid ? `${user.uid}_${targetUser.uid}` : `${targetUser.uid}_${user.uid}`;
    
    const chatDocRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatDocRef);

    if (!chatDoc.exists()) {
      await setDoc(chatDocRef, {
        users: [user.uid, targetUser.uid],
        type: 'dm',
        createdAt: new Date(),
      });
    }
    setActiveChat({ id: chatId, name: targetUser.displayName, type: 'dm' });
    setSearch('');
  }

  const messageMyself = async () => {
    if (!user) return;
    const chatId = `${user.uid}_${user.uid}`;
    const chatDocRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatDocRef);
    if (!chatDoc.exists()) {
      await setDoc(chatDocRef, {
        users: [user.uid],
        type: 'dm',
        createdAt: new Date(),
      });
    }
    setActiveChat({ id: chatId, name: user.displayName || 'Myself', type: 'dm' });
  }

  const channels: Chat[] = [{ id: 'general', name: 'General', type: 'channel' }];

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
      
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {search ? (
           <SidebarContent className="p-2">
            <p className="px-2 pb-2 text-xs text-muted-foreground">Users</p>
            <SidebarMenu>
              {filteredUsers.map((u) => (
                <SidebarMenuItem key={u.uid}>
                   <button onClick={() => createOrOpenDm(u)} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent w-full text-left">
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={u.photoURL ?? undefined} alt={u.displayName} />
                       <AvatarFallback>{u.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                     </Avatar>
                     <span>{u.displayName}</span>
                   </button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        ) : (
          <SidebarContent className="p-2">
            <SidebarGroup>
                <SidebarGroupLabel>Channels</SidebarGroupLabel>
                <SidebarMenu>
                {channels.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                        onClick={() => setActiveChat(chat)}
                        isActive={activeChat?.id === chat.id}
                    >
                        # {chat.name}
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="flex justify-between items-center">
                Direct Messages
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={messageMyself} isActive={activeChat?.id === `${user?.uid}_${user?.uid}`}>
                      <Avatar className="h-6 w-6 -ml-1">
                          <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                          <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>(you)</span>
                      <span className="text-muted-foreground ml-auto text-xs">Message myself</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {dms.filter(dm => dm.id !== `${user?.uid}_${user?.uid}`).map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveChat(chat)}
                      isActive={activeChat?.id === chat.id}
                    >
                      <AtSign className="h-4 w-4" />
                      {chat.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        )}
      </ScrollArea>

      <SidebarSeparator />
      <SidebarFooter className="p-4">
        {user && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate">{user.displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
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
