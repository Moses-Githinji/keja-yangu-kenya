import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  User,
  Check,
  CheckCheck,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, Chat, Message } from "@/api/chat";
import { getSocket } from "@/lib/socket";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

const Messages = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const socket = getSocket();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, { isOnline: boolean; lastSeen?: string }>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["user-chats"],
    queryFn: async () => {
      const res = await chatApi.getChats();
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const conversations = conversationsData || [];

  // 2. Fetch Messages for Selected Chat
  const { data: messagesResponse, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return { messages: [] };
      const res = await chatApi.getMessages(selectedChat);
      return res.data.data;
    },
    enabled: !!selectedChat,
  });

  const messages = messagesResponse?.messages || [];

  // Scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, selectedChat]);

  // 3. Real-time Listener
  useEffect(() => {
    if (!selectedChat) return;

    if (!socket.connected) socket.connect();
    socket.emit("join-conversation", selectedChat);

    const handleNewMessage = (payload: { message: Message; chatId: string }) => {
      if (payload.chatId === selectedChat) {
        queryClient.setQueryData(
          ["chat-messages", selectedChat],
          (old: { messages: Message[] } | undefined) => {
            if (!old) return { messages: [payload.message] };
            if (old.messages.some((m) => m.id === payload.message.id)) return old;
            return {
              ...old,
              messages: [payload.message, ...old.messages],
            };
          }
        );
        scrollToBottom();
      }
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
    };

    socket.on("new-message", handleNewMessage);

    socket.on("user-typing", (payload: { userId: string; chatId: string }) => {
      if (payload.chatId === selectedChat) {
        setIsTyping((prev) => ({ ...prev, [payload.userId]: true }));
      }
    });

    socket.on("user-stopped-typing", (payload: { userId: string; chatId: string }) => {
      if (payload.chatId === selectedChat) {
        setIsTyping((prev) => ({ ...prev, [payload.userId]: false }));
      }
    });

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
      socket.emit("leave-conversation", selectedChat);
    };
  }, [selectedChat, queryClient, socket]);

  // Initial Online Status
  useEffect(() => {
    if (conversationsData) {
      const statusMap: Record<string, { isOnline: boolean; lastSeen?: string }> = {};
      conversationsData.forEach((chat) => {
        const other = chat.agent;
        if (other) {
          statusMap[other.id] = { isOnline: !!other.isOnline, lastSeen: other.lastSeen };
        }
      });
      setOnlineUsers(statusMap);
    }
  }, [conversationsData]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
  }, [isAuthenticated, navigate]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChat) throw new Error("No conversation selected");
      return chatApi.sendMessage(selectedChat, content);
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedChat] });
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    sendMessageMutation.mutate(messageText);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.agent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.agent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.property?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChat = conversations.find((conv) => conv.id === selectedChat);
  const currentMessages = selectedChat ? messages : [];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <h1 className="text-4xl font-bold">Messages</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Chat with agents and manage your property inquiries
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Conversations</CardTitle>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">
                      {isLoadingConversations ? (
                        <div className="flex justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                          No conversations found.
                        </div>
                      ) : (
                        filteredConversations.map((conversation) => (
                          <motion.div
                            key={conversation.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 cursor-pointer transition-colors ${
                              selectedChat === conversation.id
                                ? "bg-accent"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => handleChatSelect(conversation.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={conversation.agent.avatar}
                                    alt={conversation.agent.firstName}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {conversation.agent.firstName[0]}
                                    {conversation.agent.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {onlineUsers[conversation.agent.id]?.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {conversation.agent.firstName} {conversation.agent.lastName}
                                  </h4>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(conversation.updatedAt)}
                                  </span>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                  {conversation.messages?.[0]?.content || "Started a chat"}
                                </p>

                                <div className="flex items-center justify-between">
                                  {conversation.property && (
                                    <div className="flex items-center space-x-2">
                                      {conversation.property.images?.[0] && (
                                        <img
                                          src={conversation.property.images[0].url}
                                          alt={conversation.property.title}
                                          className="w-6 h-6 rounded object-cover"
                                        />
                                      )}
                                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                        {conversation.property.title}
                                      </span>
                                    </div>
                                  )}

                                  {(conversation.unreadCount ?? 0) > 0 && (
                                    <Badge
                                      variant="default"
                                      className="h-5 px-2 text-xs"
                                    >
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={currentChat?.agent.avatar}
                                alt={currentChat?.agent.firstName}
                              />
                              <AvatarFallback className="text-xs">
                                {currentChat?.agent.firstName[0]}
                                {currentChat?.agent.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            {onlineUsers[currentChat?.agent.id || ""]?.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {currentChat?.agent.firstName} {currentChat?.agent.lastName}
                            </CardTitle>
                            <CardDescription className="flex items-center space-x-2">
                              <span>
                                {onlineUsers[currentChat?.agent.id || ""]?.isOnline 
                                  ? "Online" 
                                  : onlineUsers[currentChat?.agent.id || ""]?.lastSeen 
                                    ? `Last seen ${formatDate(onlineUsers[currentChat?.agent.id || ""].lastSeen!)}` 
                                    : "Offline"}
                              </span>
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Property Info */}
                      {currentChat?.property && (
                        <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg mt-2">
                          {currentChat.property.images?.[0] && (
                            <img
                              src={currentChat.property.images[0].url}
                              alt={currentChat.property.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {currentChat.property.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              {currentChat.property.location && (
                                <>
                                  <MapPin className="h-3 w-3" />
                                  <span>{currentChat.property.location}</span>
                                  <span>•</span>
                                </>
                              )}
                              {currentChat.property.price && (
                                <span className="font-medium text-primary">
                                  KES {currentChat.property.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link to={`/property/${currentChat.property.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="p-0 h-[400px]">
                      <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                          {isLoadingMessages ? (
                            <div className="flex justify-center p-8">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            [...currentMessages]
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((message) => {
                              const isMe = message.senderId === user?.id;
                              return (
                                <motion.div
                                  key={message.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex ${
                                    isMe ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div className="max-w-[70%]">
                                    <div
                                      className={`rounded-lg px-4 py-2 ${
                                        isMe
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted"
                                      }`}
                                    >
                                      <p className="text-sm">{message.content}</p>
                                      <div
                                        className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                                          isMe
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        <span>
                                          {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                        {isMe && (
                                          message.isRead ? (
                                            <CheckCheck className="h-3 w-3" />
                                          ) : (
                                            <Check className="h-3 w-3" />
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                          
                          {Object.values(isTyping).some(Boolean) && (
                            <div className="flex justify-start">
                              <div className="bg-muted p-2 rounded-lg rounded-bl-none">
                                <div className="flex gap-1">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </CardContent>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value);
                            if (selectedChat) {
                              socket.emit("typing-start", { chatId: selectedChat });
                              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                              typingTimeoutRef.current = setTimeout(() => {
                                socket.emit("typing-stop", { chatId: selectedChat });
                              }, 3000);
                            }
                          }}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          disabled={sendMessageMutation.isPending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                          size="icon"
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-muted-foreground">
                        Choose a conversation from the list to start chatting
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
