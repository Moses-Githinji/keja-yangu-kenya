import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
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
  Clock,
  User,
  Check,
  CheckCheck,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Messages = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      agent: {
        id: 1,
        name: "Sarah Kamau",
        avatar: "/api/placeholder/40/40",
        company: "Prime Properties Kenya",
        rating: 4.8,
        phone: "+254 700 123 456",
        email: "sarah@primeproperties.co.ke",
      },
      property: {
        id: 1,
        title: "Modern 3-Bedroom Apartment",
        location: "Westlands, Nairobi",
        price: "KES 25,000,000",
        image: "/api/placeholder/60/60",
      },
      lastMessage:
        "Thank you for your interest! When would you like to schedule a viewing?",
      lastMessageTime: "2 hours ago",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      agent: {
        id: 2,
        name: "John Ochieng",
        avatar: "/api/placeholder/40/40",
        company: "Urban Living Realty",
        rating: 4.9,
        phone: "+254 700 234 567",
        email: "john@urbanliving.co.ke",
      },
      property: {
        id: 2,
        title: "Luxury Villa with Pool",
        location: "Karen, Nairobi",
        price: "KES 45,000,000",
        image: "/api/placeholder/60/60",
      },
      lastMessage:
        "The property is still available. Would you like to see it this weekend?",
      lastMessageTime: "1 day ago",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      agent: {
        id: 3,
        name: "Grace Wanjiku",
        avatar: "/api/placeholder/40/40",
        company: "Keja Solutions",
        rating: 4.7,
        phone: "+254 700 345 678",
        email: "grace@kejasolutions.co.ke",
      },
      property: {
        id: 3,
        title: "Studio Apartment",
        location: "Kilimani, Nairobi",
        price: "KES 8,500,000",
        image: "/api/placeholder/60/60",
      },
      lastMessage:
        "I've sent you the floor plan. Let me know if you have any questions!",
      lastMessageTime: "3 days ago",
      unreadCount: 1,
      isOnline: true,
    },
  ]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 1,
      senderType: "agent",
      content:
        "Hello! Thank you for your interest in the Modern 3-Bedroom Apartment in Westlands. How can I help you today?",
      timestamp: "2024-01-15T10:00:00Z",
      isRead: true,
    },
    {
      id: 2,
      senderId: user?.id,
      senderType: "user",
      content:
        "Hi Sarah! I'm interested in viewing this apartment. Is it still available?",
      timestamp: "2024-01-15T10:05:00Z",
      isRead: true,
    },
    {
      id: 3,
      senderId: 1,
      senderType: "agent",
      content:
        "Yes, it's still available! The apartment is in excellent condition and ready for viewing. When would you like to schedule a viewing?",
      timestamp: "2024-01-15T10:10:00Z",
      isRead: true,
    },
    {
      id: 4,
      senderId: user?.id,
      senderType: "user",
      content:
        "That sounds great! I'm available this weekend. What times do you have available?",
      timestamp: "2024-01-15T10:15:00Z",
      isRead: false,
    },
    {
      id: 5,
      senderId: 1,
      senderType: "agent",
      content:
        "Thank you for your interest! When would you like to schedule a viewing?",
      timestamp: "2024-01-15T12:00:00Z",
      isRead: false,
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    // TODO: Fetch conversations and messages from API
  }, [isAuthenticated, navigate]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    setIsLoading(true);
    try {
      const newMessage = {
        id: Date.now(),
        senderId: user?.id,
        senderType: "user" as const,
        content: messageText.trim(),
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");

      // TODO: Send message to API
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId);
    // Mark messages as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === chatId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.property.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                      {filteredConversations.map((conversation) => (
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
                                  alt={conversation.agent.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {conversation.agent.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                                  conversation.isOnline
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {conversation.agent.name}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {conversation.lastMessageTime}
                                </span>
                              </div>

                              <p className="text-xs text-muted-foreground mb-1">
                                {conversation.agent.company}
                              </p>

                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {conversation.lastMessage}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={conversation.property.image}
                                    alt={conversation.property.title}
                                    className="w-6 h-6 rounded object-cover"
                                  />
                                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                    {conversation.property.title}
                                  </span>
                                </div>

                                {conversation.unreadCount > 0 && (
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
                      ))}
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
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={currentChat?.agent.avatar}
                              alt={currentChat?.agent.name}
                            />
                            <AvatarFallback className="text-xs">
                              {currentChat?.agent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {currentChat?.agent.name}
                            </CardTitle>
                            <CardDescription className="flex items-center space-x-2">
                              <Building className="h-3 w-3" />
                              <span>{currentChat?.agent.company}</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{currentChat?.agent.rating}</span>
                              </div>
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
                      <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <img
                          src={currentChat?.property.image}
                          alt={currentChat?.property.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {currentChat?.property.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{currentChat?.property.location}</span>
                            <span>•</span>
                            <span className="font-medium text-primary">
                              {currentChat?.property.price}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="p-0 h-[400px]">
                      <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                          {currentMessages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${
                                message.senderType === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] ${
                                  message.senderType === "user"
                                    ? "order-2"
                                    : "order-1"
                                }`}
                              >
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    message.senderType === "user"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <div
                                    className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                                      message.senderType === "user"
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <span>
                                      {new Date(
                                        message.timestamp
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    {message.senderType === "user" &&
                                      (message.isRead ? (
                                        <CheckCheck className="h-3 w-3" />
                                      ) : (
                                        <Check className="h-3 w-3" />
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          disabled={isLoading}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || isLoading}
                          size="icon"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
