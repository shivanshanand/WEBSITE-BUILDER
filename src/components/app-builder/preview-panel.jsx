import { Sandpack } from '@codesandbox/sandpack-react';
import { Eye, Monitor, DeviceMobile, DeviceRotate } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function PreviewPanel({ files }) {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Convert files to Sandpack format
  const convertFilesToSandpack = (files) => {
    const sandpackFiles = {};
    
    Object.entries(files).forEach(([filePath, content]) => {
      // Convert file paths to Sandpack format (remove leading slash if present)
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      sandpackFiles[`/${cleanPath}`] = content;
    });

    return sandpackFiles;
  };

  const customSetup = {
    dependencies: {
      "next": "^14.0.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "@types/node": "^20.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "typescript": "^5.0.0",
      "tailwindcss": "^3.3.0",
      "autoprefixer": "^10.4.16",
      "postcss": "^8.4.31"
    }
  };

  if (Object.keys(files).length === 0) {
    return (
      <div className="flex flex-col h-full bg-neutral-950">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-100">Preview</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-500">
          <div className="text-center">
            <Eye size={48} className="mx-auto mb-4 opacity-50" />
            <p>Generate an app to see the preview</p>
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
          <h2 className="text-lg font-semibold text-neutral-100">Preview</h2>
          <p className="text-sm text-neutral-400">Live app preview</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-neutral-900 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setViewMode('desktop')}
              className={`h-8 px-3 ${
                viewMode === 'desktop' 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Monitor size={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              onClick={() => setViewMode('mobile')}
              className={`h-8 px-3 ${
                viewMode === 'mobile' 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <DeviceMobile size={16} />
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
          >
            <DeviceRotate size={16} />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4">
        <div 
          className={`h-full mx-auto transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-sm' : 'w-full'
          }`}
        >
          <div className="h-full border border-neutral-800 rounded-lg overflow-hidden">
            <Sandpack
              key={refreshKey}
              template="nextjs"
              files={convertFilesToSandpack(files)}
              customSetup={customSetup}
              options={{
                showNavigator: false,
                showTabs: false,
                showLineNumbers: false,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: '100%',
                layout: 'preview',
                autoReload: true
              }}
              theme={{
                colors: {
                  surface1: '#0a0a0a',
                  surface2: '#171717',
                  surface3: '#262626',
                  clickable: '#999999',
                  base: '#fafafa',
                  disabled: '#525252',
                  hover: '#d4d4d4',
                  accent: '#3b82f6'
                },
                syntax: {
                  plain: '#fafafa',
                  comment: {
                    color: '#757575'
                  },
                  keyword: {
                    color: '#3b82f6'
                  },
                  tag: {
                    color: '#10b981'
                  },
                  punctuation: {
                    color: '#d4d4d4'
                  },
                  definition: {
                    color: '#fbbf24'
                  },
                  property: {
                    color: '#f472b6'
                  },
                  static: {
                    color: '#8b5cf6'
                  },
                  string: {
                    color: '#34d399'
                  }
                },
                font: {
                  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  mono: '"Fira Code", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
                  size: '14px',
                  lineHeight: '1.5'
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 