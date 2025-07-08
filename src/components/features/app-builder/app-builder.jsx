import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ChatPanel } from "./chat/chat-panel";
import { CodePreviewPanel } from "./code-preview-panel";
import { ChatHistorySidebar } from "../chat-history/chat-history-sidebar";
import { Header } from "@/components/layout/header";

/** fetch + JSON helper that sends cookies */
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    credentials: "include",      // ← include auth cookie
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function AppBuilder({ initialPrompt = "" }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState("app/page.js");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const [currentInitialPrompt, setCurrentInitialPrompt] = useState(initialPrompt);
  const hasCreatedInitialConversation = useRef(false);

  // Create a new conversation when component mounts (only once)
  useEffect(() => {
    if (session?.user?.id && !currentConversationId && !isCreatingConversation && !hasCreatedInitialConversation.current) {
      hasCreatedInitialConversation.current = true;
      createNewConversation().catch(error => {
        console.error("Failed to create initial conversation:", error);
        hasCreatedInitialConversation.current = false; // Reset on error
      });
    }
  }, [session?.user?.id]); // Only depend on user ID

  // Send initial prompt when conversation is ready (only for the very first conversation)
  useEffect(() => {
    if (
      currentInitialPrompt && 
      currentConversationId && 
      messages.length === 0 && 
      !isGenerating && 
      !hasProcessedInitialPrompt
    ) {
      setHasProcessedInitialPrompt(true);
      handleSendMessage(currentInitialPrompt);
    }
  }, [currentInitialPrompt, currentConversationId, messages.length, isGenerating, hasProcessedInitialPrompt]);

  const createNewConversation = async () => {
    if (!session || isCreatingConversation) return;
    
    setIsCreatingConversation(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
        credentials: "include", // Ensure auth cookies are sent
      });
      
      if (response.ok) {
        const conversation = await response.json();
        console.log("Created new conversation:", conversation.id);
        setCurrentConversationId(conversation.id);
        setMessages([]);
        setFiles({});
        setActiveFile("app/page.js");
        setCurrentInitialPrompt(""); // Clear the initial prompt for new chats
        setHasProcessedInitialPrompt(true); // Prevent initial prompt from running
        return conversation; // Return the conversation for caller
      } else {
        throw new Error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error; // Re-throw for caller to handle
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const loadConversation = async (conversation) => {
    try {
      setCurrentConversationId(conversation.id);
      setHasProcessedInitialPrompt(true); // Prevent initial prompt from running again
      
      // Convert database messages to chat format and extract files
      const chatMessages = [];
      let latestFiles = {};
      
      conversation.messages.forEach(msg => {
        if (msg.role === "USER") {
          chatMessages.push({
            role: msg.role.toLowerCase(),
            content: msg.content,
          });
        } else if (msg.role === "ASSISTANT") {
          try {
            // Try to parse as structured message
            const parsed = JSON.parse(msg.content);
            if (parsed.description && parsed.files) {
              // New structured format
              chatMessages.push({
                role: msg.role.toLowerCase(),
                content: parsed.description,
              });
              latestFiles = parsed.files; // Keep the latest files
            } else {
              // Fallback for old format
              chatMessages.push({
                role: msg.role.toLowerCase(),
                content: msg.content,
              });
            }
          } catch {
            // Plain text message (old format)
            chatMessages.push({
              role: msg.role.toLowerCase(),
              content: msg.content,
            });
          }
        }
      });
      
      setMessages(chatMessages);
      setFiles(latestFiles);
      setActiveFile(Object.keys(latestFiles)[0] || "app/page.js");
      
      setSidebarOpen(false); // Close sidebar on mobile after selection
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleSendMessage = async (prompt) => {
    if (!prompt.trim() || isGenerating || !currentConversationId) return;
    
    setIsGenerating(true);
    const userMessage = { role: "user", content: prompt };
    setMessages((m) => [...m, userMessage]);

    try {
      // Build proper history context including current files
      const historyWithFiles = [...messages, userMessage];
      
      // If we have current files, add them as context to the last assistant message
      if (Object.keys(files).length > 0 && historyWithFiles.length > 1) {
        // Find the last assistant message and enhance it with file context
        for (let i = historyWithFiles.length - 2; i >= 0; i--) {
          if (historyWithFiles[i].role === "assistant") {
            // Create a structured message for API context
            historyWithFiles[i] = {
              ...historyWithFiles[i],
              content: JSON.stringify({
                description: historyWithFiles[i].content,
                files: files,
                isUpdate: true
              })
            };
            break;
          }
        }
      }

      const result = await fetchJson("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          conversationId: currentConversationId,
          history: historyWithFiles
        }),
      });
      
      if (!result.success) throw new Error(result.error);

      // The AI response should be just the description, not the full JSON
      const aiResponse = result.data.description || "Generated your application successfully!";
      setMessages((m) => [...m, { role: "assistant", content: aiResponse }]);
      setFiles(result.data.files);
      setActiveFile(Object.keys(result.data.files)[0] || activeFile);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 relative">
      <div className={`fixed top-4 z-50 transition-all duration-300 ${sidebarOpen ? 'left-[21rem]' : 'left-4'}`}>
        <Header 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          showSidebarToggle={true}
        />
      </div>
      
      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentConversationId={currentConversationId}
        onConversationSelect={loadConversation}
        onNewChat={createNewConversation}
        isCreatingConversation={isCreatingConversation}
      />
      
      <div className={`flex w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        <div className="w-2/5 border-r border-neutral-800">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            initialPrompt={initialPrompt}
            conversationId={currentConversationId}
          />
        </div>
        <div className="flex-1">
          <CodePreviewPanel
            files={files}
            activeFile={activeFile}
            onFileSelect={setActiveFile}
          />
        </div>
      </div>
    </div>
  );
}