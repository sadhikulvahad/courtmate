import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  User,
  Search,
  ChevronLeft,
  Video,
  Send,
  MoreVertical,
  Paperclip,
  X,
  Image,
  FileText,
  Trash,
} from "lucide-react";
import NavBar from "@/components/ui/NavBar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { socket } from "@/App";
import { useLocation } from "react-router-dom";
import { GetConversation, GetMessages } from "@/api/chatApi";
import { Booking, Message } from "@/types/Types";
import { getBook } from "@/api/booking";
import { toast } from "sonner";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";

interface Conversation {
  _id: string;
  participants: {
    userId: { _id: string; name: string; email: string; role: string };
    role: string;
  }[];
  lastMessage?: {
    _id: string;
    attachments?: Attachment[];
    content: string;
    timeStamp: Date;
    status: string;
  };
  startedAt: Date;
  unreadCount?: number;
}

interface TypingUser {
  userId: string;
  name: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | undefined;
  fileName?: string;
}

interface Attachment {
  fileUrl: string;
  fileName?: string;
  fileType?: "image" | "file";
}

type ModalImage = {
  url: string;
  name?: string;
};

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [modalImage, setModalImage] = useState<ModalImage | null>(null);
  const [advocateId, setAdvocateId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const conversationId = queryParams.get("conversationId");
    const advocateIdParam = queryParams.get("advocateId");

    if (conversationId) setSelectedChat(conversationId);
    if (advocateIdParam) setAdvocateId(advocateIdParam);
  }, [location.search]);

  // Fetch conversations with error handling
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const convResponse = await GetConversation();
      console.log(convResponse);
      setConversations(convResponse?.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [fetchConversations, isAuthenticated]);

  useEffect(() => {
    if (!advocateId) {
      const advId =
        conversations
          .find((c) => c._id === selectedChat)
          ?.participants.find((p) => p.role === "advocate")?.userId._id ?? null;

      setAdvocateId(advId);
    }

    if (!userId) {
      const userId =
        conversations
          .find((c) => c._id === selectedChat)
          ?.participants.find((p) => p.role === "user")?.userId._id ?? null;
      setUserId(userId);
    }
  }, [selectedChat, advocateId, conversations]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedChat || !advocateId) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await GetMessages(selectedChat);
        setMessages(response?.data || []);
        const getBooking = await getBook(advocateId, userId);
        setBooking(getBooking.data.booking);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || "An error occurred");
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    socket.emit("join-chat", selectedChat);

    return () => {
      socket.emit("leave-chat", selectedChat);
    };
  }, [selectedChat, advocateId, userId]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === selectedChat) {
        setMessages((prev) => [...prev, message]);
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === message.conversationId
            ? {
                ...conv,
                lastMessage: {
                  _id: message._id,
                  attachments: message.attachments,
                  content: message.content,
                  timeStamp: message.timeStamp,
                  status: message.status,
                },
                unreadCount:
                  message.senderId !== user?.id
                    ? (conv.unreadCount || 0) + 1
                    : 0,
              }
            : conv
        )
      );
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", (data) => {
      if (data.conversationId === selectedChat && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          if (!prev.find((u) => u.userId === data.userId)) {
            return [...prev, { userId: data.userId, name: data.name }];
          }
          return prev;
        });
      }
    });
    socket.on("user-stop-typing", (data) => {
      if (data.conversationId === selectedChat) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    });
    socket.on("message-read", (data) => {
      if (data.conversationId === selectedChat) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId ? { ...msg, status: "read" } : msg
          )
        );
      }
    });

    socket.on("message-deleted", handleMessageDeleted);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("message-read");
      socket.off("message-deleted", handleMessageDeleted);
    };
  }, [selectedChat, user?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        console.log("Preview URL revoked");
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleDeleteMessage = (messageId: string) => {
    socket.emit("delete-message", {
      messageId,
      conversationId: selectedChat,
      userId: user?.id,
    });
  };

  const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isDeleted: true, content: "" } : msg
      )
    );
  };

  const getFileType = (file: File): "image" | "file" => {
    if (file.type.startsWith("image/")) return "image";
    return "file";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    e.target.value = "";
  };

  // Add file removal handler
  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (!selectedChat || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        conversationId: selectedChat,
        userId: user.id,
        name: user.name,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop-typing", {
        conversationId: selectedChat,
        userId: user.id,
      });
    }, 1000);
  };

  const getFileIcon = (fileType?: string, fileName?: string) => {
    if (fileType === "image") {
      return <Image className="w-5 h-5" />;
    } else {
      const extension = fileName?.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "pdf":
          return <FileText className="w-5 h-5 text-red-500" />;
        case "doc":
        case "docx":
          return <FileText className="w-5 h-5 text-blue-500" />;
        case "xls":
        case "xlsx":
          return <FileText className="w-5 h-5 text-green-500" />;
        default:
          return <FileText className="w-5 h-5 text-gray-500" />;
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Enhanced send message with validation
  const handleSendMessage = useCallback(async () => {
    if (
      (!newMessage.trim() && !selectedFile) ||
      !selectedChat ||
      !user ||
      !isOnline
    )
      return;

    try {
      setIsUploading(true);
      let fileMeta: Attachment = {
        fileUrl: "",
        fileName: "",
        fileType: "file",
      };

      // Upload file if selected
      if (selectedFile) {
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        if (selectedFile.size > maxSize) {
          toast.error("File too large. Maximum size is 20MB.");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResponse = await axiosInstance.post(
          `/chat/upload`,
          formData
        );

        fileMeta = {
          fileUrl: uploadResponse.data.url,
          fileName: uploadResponse.data.fileName,
          fileType: uploadResponse.data.fileType,
        };
      }

      const messageData = {
        conversationId: selectedChat,
        senderId: user.id,
        receiverId: conversations
          .find((c) => c._id === selectedChat)
          ?.participants.find((p) => p.userId._id !== user.id)?.userId._id,
        content: newMessage.trim(),
        senderName: user.name,
        type: selectedFile ? "file" : "text",
        attachments: selectedFile ? [fileMeta] : [],
      };

      socket.emit("send-message", messageData);
      setNewMessage("");
      handleRemoveFile(); // Clear file selection
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          "Failed to send attachment. Please try again.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred while sending the message.");
      }
    } finally {
      setIsUploading(false);

      // Stop typing
      if (isTyping) {
        setIsTyping(false);
        socket.emit("stop-typing", {
          conversationId: selectedChat,
          userId: user.id,
        });
      }
    }
  }, [
    newMessage,
    selectedChat,
    user,
    isOnline,
    conversations,
    isTyping,
    selectedFile,
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!error) {
        handleSendMessage();
      } else if (user?.role === "advocate") {
        handleSendMessage();
      }
    } else {
      handleTyping();
    }
  };

  const handleVideoCall = () => {
    if (booking) {
      navigate(`/video/${booking?.roomId}`);
    } else if (error) {
      toast.error(`You don't have booking at this time`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diff = now.getTime() - msgTime.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return msgTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return msgTime.toLocaleDateString([], { weekday: "short" });
    } else {
      return msgTime.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const currentChat = conversations.find((c) => c._id === selectedChat);
  const otherParticipant = currentChat?.participants.find(
    (p) => p.userId._id !== user?.id
  );

  // Sort and filter conversations
  const sortedConversations = [...conversations].sort((a, b) => {
    const aTime = a.lastMessage?.timeStamp
      ? new Date(a.lastMessage.timeStamp).getTime()
      : new Date(a.startedAt).getTime();
    const bTime = b.lastMessage?.timeStamp
      ? new Date(b.lastMessage.timeStamp).getTime()
      : new Date(b.startedAt).getTime();
    return bTime - aTime; // Sort in descending order (most recent first)
  });

  const filteredConversations = sortedConversations.filter((conv) =>
    conv.participants.some((p) =>
      p.userId.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openImageModal = (imageUrl: string, fileName: string | undefined) => {
    setModalImage({ url: imageUrl, name: fileName });
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  return (
    <>
      {user?.role !== "advocate" && <NavBar />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with connection status */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sidebar - Conversations List */}
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {user?.role === "user" ? "My Advocates" : "My Clients"}
                </h2>
                <button
                  onClick={fetchConversations}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                  disabled={isLoading}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(
                    (p) => p.userId._id !== user?.id
                  );
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => setSelectedChat(conversation._id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat === conversation._id
                          ? "bg-blue-50 border-r-4 border-r-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          {conversation.unreadCount! > 0 && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unreadCount! > 9
                                ? "9+"
                                : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherParticipant?.userId.name}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {conversation.lastMessage &&
                                formatTime(conversation.lastMessage.timeStamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.content?.trim()
                              ? conversation.lastMessage.content
                              : conversation.lastMessage?.attachments?.[0]
                              ? conversation.lastMessage.attachments[0]
                                  .fileType === "image"
                                ? "Image"
                                : "File"
                              : "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {otherParticipant?.userId.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                        onClick={handleVideoCall}
                      >
                        <Video size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {isLoading && messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`mb-4 flex ${
                            message.senderId === user?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`relative group max-w-[70%] px-2 py-1 rounded-lg ${
                              message.senderId === user?.id
                                ? "bg-gray-500 text-white"
                                : "bg-white text-gray-800 shadow-sm"
                            }`}
                          >
                            {message.isDeleted ? (
                              <p className="text-sm italic text-gray-400">
                                This message was deleted
                              </p>
                            ) : (
                              <>
                                <p className="text-base">{message.content}</p>
                                <span className="text-xs text-gray-700">
                                  {formatTime(message.timeStamp)}
                                </span>

                                {message.attachments &&
                                message.attachments.length > 0 ? (
                                  <div className="mt-2">
                                    {message.attachments.map(
                                      (attachment, index) => {
                                        const isImage =
                                          attachment.fileType === "image";
                                        const imageUrl = attachment.fileUrl;
                                        return (
                                          <div key={index} className="mb-2">
                                            {isImage ? (
                                              <img
                                                src={imageUrl}
                                                alt={
                                                  attachment.fileName ||
                                                  "Attachment"
                                                }
                                                className="max-w-full max-h-60 rounded-lg object-contain border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() =>
                                                  openImageModal(
                                                    imageUrl,
                                                    attachment.fileName
                                                  )
                                                }
                                              />
                                            ) : (
                                              <a
                                                href={attachment.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                              >
                                                {getFileIcon(
                                                  attachment.fileType,
                                                  attachment.fileName
                                                )}
                                                <span className="truncate max-w-xs">
                                                  {attachment.fileName ||
                                                    "File"}
                                                </span>
                                              </a>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                ) : null}
                              </>
                            )}

                            {/* Delete button only visible on hover */}
                            {message.senderId === user?.id && !message.isDeleted &&(
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-6 h-6 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <Trash size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {typingUsers.length > 0 && (
                        <div className="flex justify-start mb-4">
                          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 ml-2">
                                {typingUsers[0].name} is typing...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* File Preview */}
                {selectedFile && (
                  <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex-shrink-0">
                        {selectedFile.type.startsWith("image/") ? (
                          <div>
                            <p className="text-xs text-green-600 mb-1">
                              Image Preview:
                            </p>
                            <img
                              src={previewUrl!}
                              alt="Preview"
                              className="w-12 h-12 object-cover rounded border"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-blue-600 mb-1">
                              File Icon:
                            </p>
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center border">
                              {getFileIcon(
                                getFileType(selectedFile),
                                selectedFile.name
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Type: {selectedFile.type || "unknown"}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  {error && user?.role !== "advocate" && (
                    <div className="bg-red-50 border border-red-50 m-2 p-2 text-red-500 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 ">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={isUploading}
                    >
                      <Paperclip size={20} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <div className="flex-1 relative">
                      <textarea
                        ref={messageInputRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          isOnline
                            ? "Type your message..."
                            : "You're offline. Connect to send messages."
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={1}
                        disabled={!isOnline || isUploading}
                        style={{
                          minHeight: "40px",
                          maxHeight: "120px",
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={
                        (!newMessage.trim() && !selectedFile) ||
                        !isOnline ||
                        isUploading ||
                        (user?.role === "user" && Boolean(error))
                      }
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Start Conversation
                  </h3>
                  <p className="text-gray-600">
                    Select a conversation to start chatting with your{" "}
                    {user?.role === "user" ? "advocate" : "client"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={!!modalImage}
        onClose={closeImageModal}
        imageUrl={modalImage?.url}
        fileName={modalImage?.name}
      />
    </>
  );
};

export default Chat;

const ImageModal = ({
  isOpen,
  onClose,
  imageUrl,
  fileName,
}: ImageModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-lg rounded-xl max-h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-gray-300 z-10"
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt={fileName || "Image"}
          className="max-w-full max-h-full object-contain rounded-md"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// is there any problem, because there is something wrong with the lastmassage showing and message count and like those
