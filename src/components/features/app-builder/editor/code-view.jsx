import { useState } from "react";
import Editor from "@monaco-editor/react";
import { FileTree } from "./file-tree";
import { File, FolderOpen } from "@phosphor-icons/react";

export function CodeView({ files, activeFile, onFileSelect, onFileChange }) {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const handleEditorChange = (value) => {
    if (activeFile && value !== undefined) {
      onFileChange(activeFile, value);
    }
  };

  const getLanguageFromFileName = (filename) => {
    const extension = filename.split(".").pop();
    switch (extension) {
      case "tsx":
      case "ts":
        return "typescript";
      case "jsx":
      case "js":
        return "javascript";
      case "css":
        return "css";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "html":
        return "html";
      default:
        return "javascript";
    }
  };

  return (
    <div className="flex h-full">
      {/* File Tree Sidebar */}
      <div
        className="border-r border-neutral-800 bg-neutral-950"
        style={{ width: sidebarWidth }}
      >
        <FileTree
          files={files}
          activeFile={activeFile}
          onFileSelect={onFileSelect}
        />
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 bg-neutral-800 cursor-col-resize hover:bg-neutral-700 transition-colors"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = sidebarWidth;

          const handleMouseMove = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            setSidebarWidth(Math.max(200, Math.min(400, newWidth)));
          };

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      />

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {activeFile && (
          <>
            {/* Active File Tab */}
            <div className="p-3 border-b border-neutral-800 bg-neutral-900">
              <div className="flex items-center gap-2 text-neutral-300">
                <File size={16} />
                <span className="text-sm font-mono">{activeFile}</span>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={getLanguageFromFileName(activeFile)}
                value={files[activeFile] || ""}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: "on",
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true,
                  },
                }}
              />
            </div>
          </>
        )}

        {!activeFile && (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a file to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 