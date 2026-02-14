"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/contexts/chat-context'; // Import context
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    MessageCircle,
    X,
    Send,
    Minimize2,
    Maximize2,
    Paperclip,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data Types
interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline';
    role: 'client' | 'freelancer';
}

interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isRead: boolean;
}

interface Conversation {
    id: string;
    withUser: ChatUser;
    lastMessage?: ChatMessage;
    unreadCount: number;
    projectId?: string;
    projectTitle?: string;
}

export function FloatingChatWidget() {
    const pathname = usePathname();
    const { isOpen, setIsOpen, activeConversationId, setActiveConversationId, closeChat } = useChat();
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Routes where the chat widget should NOT appear
    const hiddenRoutes = ['/', '/login', '/register', '/auth/login', '/auth/register', '/auth/signup'];
    const shouldHide = hiddenRoutes.includes(pathname) || pathname?.startsWith('/auth/');

    // Mock Data
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: 'c1',
            withUser: { id: 'u1', name: 'Alice Smith', status: 'online', role: 'client' },
            projectId: 'p1',
            projectTitle: 'E-commerce Website',
            lastMessage: { id: 'm1', senderId: 'u1', text: 'Hey, how is the progress?', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false },
            unreadCount: 1
        },
        {
            id: 'c2',
            withUser: { id: 'u2', name: 'Bob Jones', status: 'offline', role: 'freelancer' },
            projectId: 'p2',
            projectTitle: 'Logo Design',
            lastMessage: { id: 'm2', senderId: 'me', text: 'I submitted the files.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
            unreadCount: 0
        }
    ]);

    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'm1', senderId: 'u1', text: 'Hey, how is the progress?', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false }
    ]);

    // Refs for auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeConversationId, isOpen]);

    const toggleMain = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const openConversation = (convId: string) => {
        setActiveConversationId(convId);
        // Logic to fetch messages for this conversation would go here
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'me', // Current user
            text: inputValue,
            timestamp: new Date(),
            isRead: true
        };

        setMessages([...messages, newMessage]);
        setInputValue("");

        // Update last message in conversation list
        setConversations(prev => prev.map(c =>
            c.id === activeConversationId
                ? { ...c, lastMessage: newMessage }
                : c
        ));
    };

    const activeConv = conversations.find(c => c.id === activeConversationId);

    // If we should hide the widget, render nothing
    if (shouldHide) return null;

    // -- RENDER HELPERS -- //

    // 1. Floating Button (Collapsed)
    if (!isOpen) {
        return (
            <Button
                onClick={toggleMain}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white z-50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-blue-500/25"
                title="Open Chat"
            >
                <MessageCircle className="h-7 w-7" />
                {conversations.some(c => c.unreadCount > 0) && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </Button>
        );
    }

    // 2. Chat Window (Expanded)
    return (
        <Card
            className={cn(
                "fixed bottom-6 right-6 w-[360px] shadow-2xl z-50 transition-all duration-300 flex flex-col overflow-hidden border-0 rounded-2xl ring-1 ring-black/5 font-sans",
                isMinimized ? "h-[70px]" : "h-[550px]"
            )}
        >
            {/* Header */}
            <div className="text-white p-4 flex items-center justify-between shrink-0 cursor-pointer bg-slate-900 border-b border-white/10" onClick={() => !isMinimized && activeConversationId && setActiveConversationId(null)}>
                <div className="flex items-center gap-3">
                    {activeConversationId ? (
                        <div className="flex items-center gap-3" onClick={(e) => { e.stopPropagation(); setActiveConversationId(null); }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 rounded-full -ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </Button>
                            <div className="relative">
                                <Avatar className="h-9 w-9 border-2 border-white/10">
                                    <AvatarFallback className="bg-blue-600 text-white font-bold">{activeConv?.withUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {activeConv?.withUser.status === 'online' && (
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm leading-none">{activeConv?.withUser.name}</h4>
                                <p className="text-[11px] text-blue-200 mt-1 opacity-90 truncate max-w-[140px]">{activeConv?.projectTitle}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg leading-none">Messages</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">TrustLance Chat</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Body */}
            {!isMinimized && (
                <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden relative">
                    {activeConversationId ? (
                        /* ACTIVE CHAT VIEW */
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar">
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === 'me';
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={cn(
                                                    "max-w-[80%] px-4 py-3 shadow-sm text-sm relative transition-all",
                                                    isMe
                                                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                                        : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100"
                                                )}
                                            >
                                                <p className="whitespace-pre-wrap leading-relaxed pb-1">{msg.text}</p>
                                                <span className={cn(
                                                    "text-[10px] block text-right font-medium opacity-70",
                                                    isMe ? "text-blue-100" : "text-slate-400"
                                                )}>
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="bg-white p-3 border-t border-slate-100 flex items-center gap-2 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full shrink-0 transition-colors">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <Input
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-50 border-transparent focus:bg-white focus:border-blue-100 rounded-full px-4 h-10 text-sm transition-all shadow-inner placeholder:text-slate-400"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 rounded-full shrink-0 transition-all duration-200 shadow-md",
                                        inputValue.trim()
                                            ? "bg-blue-600 hover:bg-blue-700 text-white transform scale-100"
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed transform scale-95"
                                    )}
                                >
                                    <Send className="h-4 w-4 ml-0.5" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        /* CONVERSATION LIST VIEW */
                        <>
                            <div className="p-3 bg-white z-10 border-b border-slate-100 sticky top-0">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        placeholder="Search conversations..."
                                        className="pl-9 h-10 bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 rounded-xl text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-white z-10">
                                {conversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors group"
                                        onClick={() => openConversation(conv.id)}
                                    >
                                        <div className="relative shrink-0">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:border-blue-100 transition-colors">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold">{conv.withUser.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {conv.withUser.status === 'online' && (
                                                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-semibold text-slate-900 truncate">{conv.withUser.name}</h4>
                                                {conv.lastMessage && (
                                                    <span className={cn("text-xs font-medium", conv.unreadCount > 0 ? "text-blue-600" : "text-slate-400")}>
                                                        {conv.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={cn("text-sm truncate max-w-[180px]", conv.unreadCount > 0 ? "text-slate-800 font-medium" : "text-slate-500")}>
                                                    {conv.lastMessage?.senderId === 'me' && <span className="text-slate-400 mr-1">You:</span>}
                                                    {conv.lastMessage?.text}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm shadow-blue-200">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="p-6 text-center mt-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MessageCircle className="h-8 w-8 text-blue-400 opacity-50" />
                                    </div>
                                    <h5 className="text-sm font-semibold text-slate-600 mb-1">Start a New Chat</h5>
                                    <p className="text-xs text-slate-400 mb-4 px-4">Connect with clients or freelancers directly from their project pages.</p>
                                    <Button variant="outline" size="sm" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50">Explore Projects</Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </Card>
    );
}
