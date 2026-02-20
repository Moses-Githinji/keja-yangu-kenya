import { useEffect, useState, useRef } from "react";
import { Send, X, MessageCircle, User, Bot, Loader2, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, Message } from "@/api/chat";
import { getSocket } from "@/lib/socket";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
  agentName?: string;
  agentId?: string;
  propertyId?: string;
}

const ChatInterface = ({
  isOpen,
  onClose,
  propertyTitle,
  agentName = "Agent",
  agentId,
  propertyId,
}: ChatInterfaceProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socket = getSocket();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [agentLastSeen, setAgentLastSeen] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch or Create Chat Conversation
  const { data: chatData, isLoading: isChatLoading } = useQuery({
    queryKey: ["chat-init", agentId, propertyId],
    queryFn: async () => {
      if (!agentId) return null;
      try {
        const res = await chatApi.createChat({ agentId, propertyId });
        return res.data.data;
      } catch (error) {
        console.error("Failed to init chat", error);
        return null; // Handle error gracefully
      }
    },
    enabled: isOpen && !!agentId && !!user,
    staleTime: 1000 * 60 * 5, // Cache conversation ID specific to agent/property for 5 mins
  });

  const conversationId = chatData?.id;

  // 2. Fetch Messages
  const { data: messagesResponse, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return { messages: [] };
      const res = await chatApi.getMessages(conversationId);
      return res.data.data; // Expected { messages: [] }
    },
    enabled: !!conversationId,
    // Refetch less often if we have real-time updates, but initial fetch is needed
    staleTime: Infinity, 
  });

  const messages = messagesResponse?.messages || [];

  // 3. Real-time Listener
  useEffect(() => {
    if (!conversationId) return;

    // Join the room
    socket.emit("join-conversation", conversationId);
    
    // Connect socket if not connected (handled by getSocket logic typically, but ensure it's active)
    if (!socket.connected) {
        socket.connect();
    }

        const handleNewMessage = (payload: { message: Message; chatId: string }) => {
          if (payload.chatId === conversationId) {
            queryClient.setQueryData(
              ["chat-messages", conversationId],
              (old: { messages: Message[] } | undefined) => {
                if (!old) return { messages: [payload.message] };
    
                // Deduplicate: If we already have this message ID, ignore
                if (old.messages.some((m) => m.id === payload.message.id)) return old;
    
                // Acknowledge delivery if it's from someone else
                if (payload.message.senderId !== user?.id) {
                  socket.emit("message-delivered", { 
                    messageId: payload.message.id, 
                    chatId: conversationId 
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
        };

    socket.on("new-message", handleNewMessage);

    // Listen for status updates (Delivered/Read)
    socket.on("message-status-update", (payload: { messageId: string; status: "delivered" | "read"; chatId: string }) => {
      if (payload.chatId === conversationId) {
        queryClient.setQueryData(
          ["chat-messages", conversationId],
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
      if (payload.chatId === conversationId && payload.userId === agentId) {
        setIsTyping(true);
      }
    });

    socket.on("user-stopped-typing", (payload: { chatId: string }) => {
      if (payload.chatId === conversationId) {
        setIsTyping(false);
      }
    });

    // Online Status Listeners
    socket.on("user-status-change", (payload: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      if (payload.userId === agentId) {
        setAgentOnline(payload.isOnline);
        if (payload.lastSeen) setAgentLastSeen(payload.lastSeen);
      }
    });

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing");
      socket.off("user-stopped-typing");
      socket.off("user-status-change");
      socket.off("message-status-update");
      socket.emit("leave-conversation", conversationId); // Optional cleanup if backend supports
    };
  }, [conversationId, queryClient, socket, agentId]);

  // Initial Agent Status (from chatData)
  useEffect(() => {
    if (chatData?.agent) {
      setAgentOnline(!!chatData.agent.isOnline);
      setAgentLastSeen(chatData.agent.lastSeen || null);
    }
  }, [chatData]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isOpen]);

  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error("No conversation");
      return chatApi.sendMessage(conversationId, content);
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["chat-messages", conversationId] });
      const previousMessages = queryClient.getQueryData(["chat-messages", conversationId]);

      // Optimistic update
      const tempId = Date.now().toString();
      const optimisticMessage: Message = {
        id: tempId,
        content,
        senderId: user?.id || "temp",
        chatId: conversationId!,
        createdAt: new Date().toISOString(),
        isRead: false,
        status: "sent",
        sender: {
            id: user?.id || "user",
            firstName: user?.firstName || "Me",
            lastName: user?.lastName || "",
            role: (user?.role as "USER" | "AGENT" | "ADMIN") || "USER",
        }
      };

      queryClient.setQueryData(
        ["chat-messages", conversationId],
        (old: { messages: Message[] } | undefined) => {
          return {
            ...old,
            messages: [optimisticMessage, ...(old?.messages || [])],
          };
        }
      );

      setNewMessage(""); 
      scrollToBottom();

      return { previousMessages, tempId };
    },
    onError: (err, newTodo, context: any) => {
      // Rollback
      if (context?.previousMessages) {
        queryClient.setQueryData(["chat-messages", conversationId], context.previousMessages);
      }
      console.error("Send failed", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
    },
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log("Sending...", { newMessage, conversationId }); // Debug
    if (!newMessage.trim() || !conversationId) return;
    sendMessageMutation.mutate(newMessage);
  };

  if (!isOpen) return null;

  if (!agentId) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="mb-2 text-destructive">Connection Error</CardTitle>
          <p className="text-muted-foreground mb-4">
            Unable to start chat. Agent information is missing.
          </p>
          <Button onClick={onClose}>Close</Button>
        </Card>
      </div>
    );
  }

  if (!isChatLoading && !chatData) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
            <CardTitle className="mb-2 text-destructive">Connection Error</CardTitle>
            <p className="text-muted-foreground mb-4">
                Failed to initiate chat. Please try again later.
            </p>
            <Button onClick={onClose}>Close</Button>
        </Card>
      </div>
    );
  }

  const isLoading = isChatLoading || isMessagesLoading;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white border-b z-10">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="relative">
              <MessageCircle className="h-5 w-5 text-primary" />
              {agentOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="flex flex-col">
              <span>Chat with {agentName}</span>
              <span className="text-[10px] font-normal text-muted-foreground leading-none">
                {agentOnline ? "Online" : agentLastSeen ? `Last seen ${new Date(agentLastSeen).toLocaleTimeString()}` : "Offline"}
              </span>
            </div>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
               <div className="flex justify-center items-center h-full text-center p-4">
                <p className="text-muted-foreground">Start the conversation by sending a message.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                        <p className="text-xs">
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {isUser && (
                          <div className="flex items-center ml-1">
                            {message.status === "delivered" || message.status === "read" ? (
                              <CheckCheck 
                                className="h-4 w-4" 
                                style={{ color: message.status === "read" ? "#34B7F1" : "#34B7F1" }} 
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
            {isTyping && (
                <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 border-t flex gap-2"
          >
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                
                // Emit typing events
                if (conversationId) {
                  socket.emit("typing-start", { chatId: conversationId });
                  
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  
                  typingTimeoutRef.current = setTimeout(() => {
                    socket.emit("typing-stop", { chatId: conversationId });
                  }, 3000);
                }
              }}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              disabled={!newMessage.trim() || !conversationId || isLoading || sendMessageMutation.isPending}
              size="icon"
            >
              {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;