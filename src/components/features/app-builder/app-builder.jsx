import { useState } from "react";
import { ChatPanel } from "./chat/chat-panel";
import { CodePreviewPanel } from "./code-preview-panel";

export function AppBuilder({ initialPrompt = "" }) {
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState("app/page.js");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerateApp = async (prompt) => {
    setIsGenerating(true);
    setErrorMessage("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (result.success) {
        setFiles(result.data.files);
        setCurrentApp(result.data);
        setActiveFile(Object.keys(result.data.files)[0] || "app/page.js");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Generated a ${result.data.description}! You can now preview and edit the code.`,
          },
        ]);
      } else {
        setErrorMessage(result.error || "Unknown error");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${result.error}`,
          },
        ]);
      }
    } catch (error) {
      setErrorMessage(error.message || "Unknown error");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error generating app: ${error.message}`,
        },
      ]);
    }

    setIsGenerating(false);
  };

  const handleFileChange = (filename, content) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: content,
    }));
  };

  return (
    <div className="flex h-screen bg-neutral-950 w-full">
      {/* The AppBuilder no longer needs its own sidebar, as it's provided by the parent layout */}
      <div className="w-2/5 border-r border-neutral-800">
        <ChatPanel
          messages={messages}
          onSendMessage={handleGenerateApp}
          isGenerating={isGenerating}
          initialPrompt={initialPrompt}
        />
      </div>

      {/* Code/Preview Panel - Right (60% width) */}
      <div className="flex-1">
        <CodePreviewPanel
          files={files}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onFileChange={handleFileChange}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
