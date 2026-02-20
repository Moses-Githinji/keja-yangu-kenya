import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, Check, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, Chat, Message } from "@/api/chat";
import { useAuth } from "@/contexts/AuthContext";
import { getSocket } from "@/lib/socket";
import { formatDistanceToNow } from "date-fns";

const Messages: React.FC = () => {
  return (
    <AdminLayout>
      <MessagesContent />
    </AdminLayout>
  );
};

const MessagesContent: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socket = getSocket();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, { isOnline: boolean; lastSeen?: string }>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["agent-chats"],
    queryFn: async () => {
      const res = await chatApi.getChats();
      return res.data.data; // ChatListResponse -> data: Chat[]
    },
  });

  const conversations = conversationsData || [];

  // 2. Fetch Messages for Selected Chat
  const { data: messagesResponse, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return { messages: [] };
      const res = await chatApi.getMessages(selectedConversation);
      return res.data.data; // MessageListResponse -> data: { messages: [], pagination: {} }
    },
    enabled: !!selectedConversation,
  });

  const messages = messagesResponse?.messages || [];

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, selectedConversation]);

  // 3. Real-time Listener
  useEffect(() => {
    if (!selectedConversation) return;

    // Connect and join room
    if (!socket.connected) socket.connect();
    socket.emit("join-conversation", selectedConversation);

        const handleNewMessage = (payload: { message: Message; chatId: string }) => {
          if (payload.chatId === selectedConversation) {
            queryClient.setQueryData(
              ["chat-messages", selectedConversation],
              (old: { messages: Message[] } | undefined) => {
                if (!old) return { messages: [payload.message] };
                
                // Deduplicate
                if (old.messages.some((m) => m.id === payload.message.id)) return old;
                
                // Acknowledge delivery if from someone else
                if (payload.message.senderId !== user?.id) {
                  socket.emit("message-delivered", { 
                    messageId: payload.message.id, 
                    chatId: selectedConversation 
                  });
                }
    
                return {
                  ...old,
                  messages: [payload.message, ...old.messages], 
                };
              }
            );
            scrollToBottom();
          }
          
          // Also update conversation list last message/timestamp
          queryClient.invalidateQueries({ queryKey: ["agent-chats"] });
        };

    socket.on("new-message", handleNewMessage);
    
        // Listen for status updates
        socket.on("message-status-update", (payload: { messageId: string; status: "delivered" | "read"; chatId: string }) => {
          if (payload.chatId === selectedConversation) {
            queryClient.setQueryData(
              ["chat-messages", selectedConversation],
              (old: { messages: Message[] } | undefined) => {
                if (!old) return old;
                return {
                  ...old,
                  messages: old.messages.map((m) => 
                    m.id === payload.messageId ? { ...m, status: payload.status } : m
                  ),
                };
              }
            );
          }
        });

    // Typing Status Listeners
    socket.on("user-typing", (payload: { userId: string; chatId: string }) => {
      if (payload.chatId === selectedConversation) {
        setTypingUsers((prev) => ({ ...prev, [payload.userId]: true }));
      }
    });

    socket.on("user-stopped-typing", (payload: { userId: string; chatId: string }) => {
      if (payload.chatId === selectedConversation) {
        setTypingUsers((prev) => ({ ...prev, [payload.userId]: false }));
      }
    });

    // Online Status Listeners
    socket.on("user-status-change", (payload: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [payload.userId]: { isOnline: payload.isOnline, lastSeen: payload.lastSeen },
      }));
    });

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing");
      socket.off("user-stopped-typing");
      socket.off("user-status-change");
      socket.off("message-status-update");
      socket.emit("leave-conversation", selectedConversation);
    };
  }, [selectedConversation, queryClient, socket]);

  // Initial Online Status (from conversationsData)
  useEffect(() => {
    if (conversationsData) {
      const statusMap: Record<string, { isOnline: boolean; lastSeen?: string }> = {};
      conversationsData.forEach((chat) => {
        const other = getOtherParticipant(chat);
        if (other) {
          statusMap[other.id] = { 
            isOnline: !!other.isOnline, 
            lastSeen: other.lastSeen 
          };
        }
      });
      setOnlineUsers(statusMap);
    }
  }, [conversationsData]);


  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      return chatApi.sendMessage(selectedConversation, content);
    },
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["agent-chats"] });
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(messageContent);
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  // Identify the "other" participant
  const getOtherParticipant = (chat: Chat) => {
    // If I am the agent, the other is user. If I am admin/user acting as agent?
    // Usually these chats are between a User and me (the Agent).
    // The chat object has `user` and `agent`.
    // Since this is the Agent Dashboard, "I" am the `agent`. 
    // The other person is the `user`.
    return chat.user;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/agent"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Manage your client inquiries and conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 h-full overflow-hidden flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Inquiries</CardTitle>
              <CardDescription>Recent messages from clients</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {isLoadingConversations ? (
                   <div className="flex justify-center p-4">
                     <Loader2 className="animate-spin" />
                   </div>
                ) : conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">No conversations yet.</p>
                ) : (
                  conversations.map((chat) => {
                    const otherUser = getOtherParticipant(chat);
                    const lastMsg = chat.messages?.[0]; // Assuming newest first
                    const isActive = selectedConversation === chat.id;

                    return (
                      <div
                        key={chat.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                          isActive
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50 border-transparent"
                        }`}
                        onClick={() => setSelectedConversation(chat.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={otherUser?.avatar} />
                              <AvatarFallback>
                                {otherUser?.firstName?.charAt(0) || "U"}
                                {otherUser?.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {onlineUsers[otherUser?.id]?.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {otherUser?.firstName} {otherUser?.lastName}
                              </p>
                              {chat.unreadCount && chat.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs scale-75">
                                  {chat.unreadCount} Use
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate h-5">
                              {lastMsg?.content || "Started a chat"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(chat.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 h-full overflow-hidden flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>
                {selectedConversation
                  ? (() => {
                      const chat = conversations.find((c) => c.id === selectedConversation);
                      const other = chat ? getOtherParticipant(chat) : null;
                      const status = other ? onlineUsers[other.id] : null;

                      return (
                        <div className="flex flex-col">
                          <span>{other ? `${other.firstName} ${other.lastName}` : "Loading..."}</span>
                          {other && (
                            <span className="text-xs font-normal text-muted-foreground">
                              {status?.isOnline 
                                ? "Online" 
                                : status?.lastSeen 
                                  ? `Last seen ${formatDate(status.lastSeen)}` 
                                  : "Offline"}
                            </span>
                          )}
                        </div>
                      );
                    })()
                  : "Select a conversation"}
              </CardTitle>
              <CardDescription>
                {selectedConversation && conversations.find((c) => c.id === selectedConversation)?.property?.title 
                    ? `Property: ${conversations.find((c) => c.id === selectedConversation)?.property?.title}`
                    : "Choose a conversation from the list to start chatting"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {selectedConversation ? (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-gray-50">
                    {isLoadingMessages ? (
                        <div className="flex justify-center p-4">
                           <Loader2 className="animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <p className="text-center text-muted-foreground my-10">No messages yet.</p>
                    ) : (
                        [...messages]
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((msg) => {
                          const isMe = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[75%] px-4 py-3 rounded-lg shadow-sm ${
                                  isMe
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                                }`}
                              >
                                  <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                    <p className="text-[10px]">
                                      {formatDate(msg.createdAt)}
                                    </p>
                                    {isMe && (
                                      <div className="flex items-center">
                                        {msg.status === "delivered" || msg.status === "read" ? (
                                          <CheckCheck 
                                            className="h-4 w-4" 
                                            style={{ color: msg.status === "read" ? "#34B7F1" : "#34B7F1" }} 
                                          />
                                        ) : (
                                          <Check className="h-4 w-4 text-white/70" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                          );
                        })
                    )}
                    {Object.values(typingUsers).some(Boolean) && (
                      <div className="flex justify-start">
                        <div className="bg-white border p-3 rounded-lg rounded-bl-none shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t">
                    <div className="flex gap-2">
                        <Textarea
                        value={messageContent}
                        onChange={(e) => {
                          setMessageContent(e.target.value);
                          
                          if (selectedConversation) {
                            socket.emit("typing-start", { chatId: selectedConversation });
                            
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            
                            typingTimeoutRef.current = setTimeout(() => {
                              socket.emit("typing-stop", { chatId: selectedConversation });
                            }, 3000);
                          }
                        }}
                        placeholder="Type your reply..."
                        className="flex-1 min-h-[50px] max-h-[150px] resize-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        />
                        <Button 
                        onClick={handleSendMessage} 
                        className="self-end h-[50px] w-[50px] rounded-md"
                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                        >
                            {sendMessageMutation.isPending ? <Loader2 className="animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                  <Send className="h-12 w-12 mb-4 opacity-20" />
                  <p>Select a conversation to view messages</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
