import React, { useState } from "react";
import { CodeView } from "./editor/code-view";
import { PreviewView } from "./preview/preview-view";
import { Code, Eye, Download, GithubLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function CodePreviewPanel({
  files,
  activeFile,
  onFileSelect,
  onFileChange,
  isGenerating,
}) {
  const [view, setView] = useState("code"); // 'code' | 'preview'

  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (Object.keys(files).length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950">
        <Code size={48} className="opacity-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "code" ? "default" : "ghost"}
            onClick={() => setView("code")}
          >
            <Code size={16} className="mr-1" /> Code
          </Button>
          <Button
            size="sm"
            variant={view === "preview" ? "default" : "ghost"}
            onClick={() => setView("preview")}
          >
            <Eye size={16} className="mr-1" /> Preview
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download size={16} className="mr-1" /> Download
          </Button>
          <Button size="sm" variant="outline">
            <GithubLogo size={16} className="mr-1" /> Deploy
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {view === "code" ? (
          <CodeView
            files={files}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            onFileChange={onFileChange}
          />
        ) : (
          <PreviewView files={files} />
        )}
      </div>
    </div>
  );
}
