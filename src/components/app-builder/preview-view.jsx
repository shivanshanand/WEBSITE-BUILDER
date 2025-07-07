import { Sandpack } from '@codesandbox/sandpack-react';
import { Eye, Monitor, DeviceMobile, DeviceRotate, Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function PreviewView({ files }) {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [useReactTemplate, setUseReactTemplate] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setHasError(false);
  };

  const handleSandpackError = (error) => {
    console.error('Sandpack error:', error);
    setHasError(true);
  };

  const tryReactTemplate = () => {
    setUseReactTemplate(true);
    setHasError(false);
    setRefreshKey(prev => prev + 1);
  };

  // Convert files to Sandpack format for Next.js
  const convertFilesToSandpack = (files) => {
    const sandpackFiles = {};
    
    Object.entries(files).forEach(([filePath, content]) => {
      // Clean up file paths for Sandpack
      let cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
      // Ensure proper forward slash
      if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
      }
      
      sandpackFiles[cleanPath] = content;
    });

    // For React template, convert Next.js files to React format
    if (useReactTemplate) {
      const reactFiles = {};
      
      // Convert app/page.js to src/App.js
      if (sandpackFiles['/app/page.js']) {
        let pageContent = sandpackFiles['/app/page.js'];
        // Remove export default and convert to named export
        pageContent = pageContent.replace(/export default function \w+\(\) \{/, 'function App() {');
        pageContent = pageContent.replace(/\}$/, '}\n\nexport default App;');
        reactFiles['/src/App.js'] = pageContent;
      }
      
      // Convert CSS
      if (sandpackFiles['/app/globals.css']) {
        reactFiles['/src/styles.css'] = sandpackFiles['/app/globals.css'];
      }
      
      // Copy components
      Object.entries(sandpackFiles).forEach(([path, content]) => {
        if (path.startsWith('/components/')) {
          reactFiles[`/src${path}`] = content;
        }
      });
      
      // Add index.js
      reactFiles['/src/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;
      
      // Add index.html
      reactFiles['/public/index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Generated App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
      
      return reactFiles;
    }

    // Ensure we have required Next.js files with fallbacks
    if (!sandpackFiles['/package.json']) {
      sandpackFiles['/package.json'] = JSON.stringify({
        "name": "generated-app",
        "version": "0.1.0",
        "private": true,
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start"
        },
        "dependencies": {
          "next": "14.0.0",
          "react": "18.2.0",
          "react-dom": "18.2.0"
        }
      }, null, 2);
    }

    // Add default app/layout.js if missing
    if (!sandpackFiles['/app/layout.js'] && !sandpackFiles['/app/layout.jsx']) {
      sandpackFiles['/app/layout.js'] = `import './globals.css'

export const metadata = {
  title: 'Generated App',
  description: 'Generated Next.js app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}`;
    }

    // Add default app/page.js if missing
    if (!sandpackFiles['/app/page.js'] && !sandpackFiles['/app/page.jsx']) {
      sandpackFiles['/app/page.js'] = `export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Generated App</h1>
    </main>
  )
}`;
    }

    // Add default globals.css if missing
    if (!sandpackFiles['/app/globals.css']) {
      sandpackFiles['/app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`;
    }

    return sandpackFiles;
  };

  const customSetup = useReactTemplate ? {
    dependencies: {
      "react": "18.2.0",
      "react-dom": "18.2.0",
      "tailwindcss": "^3.3.0"
    }
  } : {
    dependencies: {
      "next": "14.0.0",
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  };

  const ErrorFallback = () => (
    <div className="h-full flex items-center justify-center text-neutral-400 bg-neutral-900">
      <div className="text-center p-8">
        <Warning size={48} className="mx-auto mb-4 text-yellow-500" />
        <h3 className="text-lg font-medium mb-2">Preview Compilation Error</h3>
        <p className="text-sm mb-4">
          {useReactTemplate 
            ? "Unable to compile the generated code."
            : "Next.js compilation failed. This may be due to external dependencies or complex routing."
          }
        </p>
        <div className="space-y-2">
          {!useReactTemplate && (
            <Button
              onClick={tryReactTemplate}
              size="sm"
              className="bg-green-600 hover:bg-green-700 mr-2"
            >
              Try React Preview
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
          <p className="text-xs text-neutral-500 mt-2">
            Check the code panel for syntax issues or external dependencies
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-neutral-100">Live Preview</h3>
          
          {useReactTemplate && (
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <span>React Mode</span>
            </div>
          )}
          
          {hasError && (
            <div className="flex items-center gap-1 text-yellow-500 text-xs">
              <Warning size={12} />
              <span>Compilation Error</span>
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex bg-neutral-900 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setViewMode('desktop')}
              className={`h-7 px-2 ${
                viewMode === 'desktop' 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Monitor size={14} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              onClick={() => setViewMode('mobile')}
              className={`h-7 px-2 ${
                viewMode === 'mobile' 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <DeviceMobile size={14} />
            </Button>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          className="h-7 px-2 bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
        >
          <DeviceRotate size={14} />
        </Button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4">
        <div 
          className={`h-full mx-auto transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-sm' : 'w-full'
          }`}
        >
          <div className="h-full border border-neutral-800 rounded-lg overflow-hidden">
            {Object.keys(files).length > 0 ? (
              hasError ? (
                <ErrorFallback />
              ) : (
                <Sandpack
                  key={`${refreshKey}-${useReactTemplate ? 'react' : 'nextjs'}`}
                  template={useReactTemplate ? "react" : "nextjs"}
                  files={convertFilesToSandpack(files)}
                  customSetup={customSetup}
                  options={{
                    showNavigator: false,
                    showTabs: false,
                    showLineNumbers: false,
                    showInlineErrors: true,
                    showErrorOverlay: false,
                    wrapContent: true,
                    editorHeight: 0,
                    layout: 'preview',
                    autoReload: true,
                    initMode: 'user-visible',
                    recompileMode: 'delayed',
                    recompileDelay: 500
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
                  onError={handleSandpackError}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Generate an app to see the preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 