import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Messages: React.FC = () => {
  return (
    <AdminLayout>
      <MessagesContent />
    </AdminLayout>
  );
};

const MessagesContent: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: 1,
      user: { name: "John Doe", email: "john@example.com", avatar: "" },
      lastMessage: "I'm interested in the property...",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      user: { name: "Jane Smith", email: "jane@example.com", avatar: "" },
      lastMessage: "When can we schedule a viewing?",
      timestamp: "1 day ago",
      unread: false,
    },
    {
      id: 3,
      user: { name: "Bob Johnson", email: "bob@example.com", avatar: "" },
      lastMessage: "Thank you for the information",
      timestamp: "2 days ago",
      unread: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "user",
      content: "Hi, I'm interested in the 3-bedroom apartment in Westlands.",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      sender: "admin",
      content:
        "Hello! Thank you for your interest. The property is still available.",
      timestamp: "2 hours ago",
    },
    {
      id: 3,
      sender: "user",
      content: "Great! Can we schedule a viewing for tomorrow?",
      timestamp: "1 hour ago",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Manage your conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>All your message threads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar} />
                        <AvatarFallback>
                          {conversation.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.user.name}
                          </p>
                          {conversation.unread && (
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400">
                          {conversation.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedConversation
                  ? conversations.find((c) => c.id === selectedConversation)
                      ?.user.name
                  : "Select a conversation"}
              </CardTitle>
              <CardDescription>
                {selectedConversation
                  ? conversations.find((c) => c.id === selectedConversation)
                      ?.user.email
                  : "Choose a conversation from the list"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === "admin"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === "admin"
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      rows={3}
                    />
                    <Button onClick={handleSendMessage} className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
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
