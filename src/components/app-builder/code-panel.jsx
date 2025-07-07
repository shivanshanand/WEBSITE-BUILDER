import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileTree } from './file-tree';
import { 
  File, 
  FolderOpen, 
  Download, 
  GithubLogo 
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export function CodePanel({ files, activeFile, onFileSelect, onFileChange }) {
  const [sidebarWidth, setSidebarWidth] = useState(300);

  const handleEditorChange = (value) => {
    if (activeFile && value !== undefined) {
      onFileChange(activeFile, value);
    }
  };

  const getLanguageFromFileName = (filename) => {
    const extension = filename.split('.').pop();
    switch (extension) {
      case 'tsx':
      case 'ts':
        return 'typescript';
      case 'jsx':
      case 'js':
        return 'javascript';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'html':
        return 'html';
      default:
        return 'typescript';
    }
  };

  const handleDownload = () => {
    // This will be implemented later with JSZip
    console.log('Download functionality coming soon');
  };

  const handleGitHub = () => {
    // This will be implemented later with GitHub API
    console.log('GitHub integration coming soon');
  };

  if (Object.keys(files).length === 0) {
    return (
      <div className="flex flex-col h-full bg-neutral-950">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-100">Code</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-500">
          <div className="text-center">
            <File size={48} className="mx-auto mb-4 opacity-50" />
            <p>Generate an app to see the code here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100">Code</h2>
          <p className="text-sm text-neutral-400">{Object.keys(files).length} files</p>
        </div>
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
            GitHub
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
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
              setSidebarWidth(Math.max(200, Math.min(500, newWidth)));
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
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
                  value={files[activeFile] || ''}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    bracketPairColorization: { enabled: true },
                    guides: {
                      indentation: true,
                      bracketPairs: true
                    }
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
    </div>
  );
} 