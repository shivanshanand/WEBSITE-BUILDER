import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLineRight, User, Robot } from "@phosphor-icons/react";

export function ChatPanel({
  messages,
  onSendMessage,
  isGenerating,
  initialPrompt,
}) {
  const [input, setInput] = useState(initialPrompt);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-100">AI Assistant</h2>
        <p className="text-sm text-neutral-400">
          {messages.length === 0
            ? "Describe your app to get started"
            : "Continue the conversation"}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-8">
            <Robot size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-4">
              Start by describing the app you want to build
            </p>
            <div className="space-y-2 text-xs text-neutral-600">
              <p>Try examples like:</p>
              <div className="space-y-1">
                <p>• "Build a modern landing page"</p>
                <p>• "Create a portfolio website"</p>
                <p>• "Design a todo app"</p>
                <p>• "Make a dashboard with charts"</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0">
              {message.role === "user" ? (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                  <Robot size={16} className="text-neutral-300" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-neutral-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                <Robot size={16} className="text-neutral-300" />
              </div>
            </div>
            <div className="flex-1">
              <div className="p-3 rounded-lg bg-neutral-800 text-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-neutral-600 border-t-neutral-300 rounded-full"></div>
                  Generating your app...
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-800">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              messages.length === 0
                ? "Describe your app... (e.g., 'Build a modern landing page')"
                : "Ask for changes or improvements..."
            }
            className="w-full h-20 pl-4 pr-12 py-3 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-400 rounded-lg focus:ring-2 focus:ring-blue-600 transition-all duration-200 resize-none focus:outline-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 bottom-2 h-8 w-8 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLineRight className="w-4 h-4" />
          </Button>
        </div>

        {messages.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Build a portfolio",
              "Create a landing page",
              "Design a todo app",
              "Build a dashboard",
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(suggestion)}
                className="text-xs bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                disabled={isGenerating}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
