"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Robot,
  Trash,
  List,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChatHistorySidebar({
  isOpen,
  onToggle,
  currentConversationId,
  onConversationSelect,
  onNewChat,
  isCreatingConversation = false,
}) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [creatingNewChat, setCreatingNewChat] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!session) return;
    
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [session]);

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    setDeleting(conversationId);
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // If we deleted the current conversation, create a new one
        if (conversationId === currentConversationId && !creatingNewChat) {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleNewChat = async () => {
    if (typeof onNewChat !== 'function' || creatingNewChat || isCreatingConversation) return;
    
    setCreatingNewChat(true);
    try {
      const newConversation = await onNewChat();
      if (newConversation) {
        // Add the new conversation to the list immediately for better UX
        setConversations(prev => [newConversation, ...prev]);
      }
      // Refresh conversations to ensure consistency
      await fetchConversations();
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setCreatingNewChat(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getConversationTitle = (conversation) => {
    if (conversation.title && conversation.title !== "New Chat" && conversation.title.trim() !== "") {
      return conversation.title;
    }
    
    // Use first user message as title
    const firstUserMessage = conversation.messages?.find(msg => msg.role === "USER");
    if (firstUserMessage) {
      const content = firstUserMessage.content.trim();
      return content.length > 40 ? content.slice(0, 40) + "..." : content;
    }
    
    return "New Chat";
  };

  if (!session) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-neutral-900 border-r border-neutral-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-72 lg:w-80
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-100">Chat History</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-neutral-400 hover:text-neutral-100 h-8 w-8 p-0"
          >
            <X size={20} />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-neutral-800">
          <Button
            onClick={handleNewChat}
            disabled={creatingNewChat || isCreatingConversation}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(creatingNewChat || isCreatingConversation) ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                New Chat
              </>
            )}
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-neutral-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-neutral-500">
              <Robot size={48} className="mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <TooltipProvider key={conversation.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onConversationSelect(conversation)}
                        className={`
                          group relative flex items-center justify-between p-3 m-1 rounded-lg cursor-pointer
                          transition-colors duration-200
                          ${conversation.id === currentConversationId 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100'
                          }
                        `}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {getConversationTitle(conversation)}
                          </h3>
                          <p className="text-xs opacity-75">
                            {formatDate(conversation.updatedAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            disabled={deleting === conversation.id}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            {deleting === conversation.id ? (
                              <div className="animate-spin h-3 w-3 border border-red-400 border-t-transparent rounded-full" />
                            ) : (
                              <Trash size={12} />
                            )}
                          </Button>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{getConversationTitle(conversation)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
