import { useState } from "react";
import { CodeView } from "./editor/code-view";
import { PreviewView } from "./preview/preview-view";
import { Code, Eye, Download, GithubLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function CodePreviewPanel({
  files,
  activeFile,
  onFileSelect,
  onFileChange,
}) {
  const [activeView, setActiveView] = useState("code"); // 'code' or 'preview'

  const handleDownload = () => {
    // This will be implemented later with JSZip
    console.log("Download functionality coming soon");
  };

  const handleGitHub = () => {
    // This will be implemented later with GitHub API
    console.log("GitHub integration coming soon");
  };

  if (Object.keys(files).length === 0) {
    return (
      <div className="flex flex-col h-full bg-neutral-950">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-100">
            Code & Preview
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-500">
          <div className="text-center">
            <Code size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-2">Generate an app to see the code and preview</p>
            <p className="text-sm text-neutral-600">
              Use the chat to describe your app
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header with Toggle */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-neutral-900 rounded-lg p-1">
            <Button
              size="sm"
              variant={activeView === "code" ? "default" : "ghost"}
              onClick={() => setActiveView("code")}
              className={`h-9 px-4 ${
                activeView === "code"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Code size={16} className="mr-2" />
              Code
            </Button>
            <Button
              size="sm"
              variant={activeView === "preview" ? "default" : "ghost"}
              onClick={() => setActiveView("preview")}
              className={`h-9 px-4 ${
                activeView === "preview"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
          </div>

          <div className="text-sm text-neutral-400">
            {Object.keys(files).length} files
            {activeView === "code" && activeFile && (
              <span> • {activeFile}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
          >
            <Download size={16} className="mr-2" />
            Download
          </Button>
          <Button
            onClick={handleGitHub}
            size="sm"
            variant="outline"
            className="bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
          >
            <GithubLogo size={16} className="mr-2" />
            Deploy
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeView === "code" ? (
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