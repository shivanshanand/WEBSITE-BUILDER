"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLineRight, GithubLogo } from "@phosphor-icons/react";
import { Header } from "@/components/header";
import { AppBuilder } from "@/components/app-builder/app-builder";

export default function Home() {
  const [input, setInput] = useState("");
  const [showAppBuilder, setShowAppBuilder] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    setInitialPrompt(input.trim());
    setShowAppBuilder(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Show app builder interface
  if (showAppBuilder) {
    return <AppBuilder initialPrompt={initialPrompt} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Button
              size="sm"
              onClick={() =>
                window.open(
                  "https://github.com/shivanshanand/WEBSITE-BUILDER.git",
                  "_blank",
                )
              }
              className="inline-flex items-center px-4 py-2 bg-transparent border border-neutral-800 text-neutral-400 hover:bg-gradient-to-b hover:from-neutral-800 hover:to-neutral-900 hover:text-neutral-100 transition-colors duration-200 rounded-lg cursor-pointer"
            >
              <GithubLogo size={24} />
              <span className="text-sm text-neutral-400">View Source Code</span>
            </Button>
          </div>

          {/* <div className="text-center mb-8">
            <div className="bg-gradient-to-b from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              <h2 className="text-6xl font-bold mb-2">Build with Prompts
              </h2>
            </div>
          </div> */}

          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the app you want to build..."
                className="w-full h-32 pl-6 pr-16 pt-6 bg-neutral-900 border-2 border-neutral-800 text-neutral-100 placeholder-neutral-400 rounded-xl focus:ring-2 focus:ring-neutral-800 transition-all duration-200 resize-none focus:outline-none"
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="absolute right-3 bottom-5 h-8 w-8 bg-blue-600 hover:bg-blue-500 rounded-lg"
              >
                <ArrowLineRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 max-w-2xl mx-auto justify-center">
            {[
              "Build a portfolio",
              "Design a landing page",
              "Design a form",
              "Develop a todo app",
              "Build a calculator",
              "Build a dashboard",
              "Build a weather app",
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(suggestion);
                  setInitialPrompt(suggestion);
                  setShowAppBuilder(true);
                }}
                className="bg-transparent border-neutral-800 text-neutral-400 hover:bg-gradient-to-b hover:from-neutral-800 hover:to-neutral-900 hover:text-neutral-100 transition-colors duration-200 rounded-lg cursor-pointer"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
