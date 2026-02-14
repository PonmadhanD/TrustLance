"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline';
    role: 'client' | 'freelancer';
}

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    activeConversationId: string | null;
    openChat: (projectId: string, withUser: ChatUser, projectTitle: string) => void;
    closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    // In a real app, this would add a new conversation to the list if it doesn't exist
    // For now, we'll just open the widget and set the active ID mock
    const openChat = (projectId: string, withUser: ChatUser, projectTitle: string) => {
        setIsOpen(true);
        // Logic to find or create conversation would go here
        // For demo, we'll assume a conversation ID format
        setActiveConversationId(`chat_${projectId}_${withUser.id}`);
        console.log(`Opening chat for project ${projectTitle} with ${withUser.name}`);
    };

    const closeChat = () => {
        setIsOpen(false);
    };

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, activeConversationId, openChat, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
