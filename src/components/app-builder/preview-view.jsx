import React, { useState, useEffect } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { Eye, Monitor, DeviceMobile, DeviceRotate, Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export function PreviewView({ files }) {
  const [viewMode, setViewMode] = useState('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sandpackFiles, setSandpackFiles] = useState(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
  };

  // Convert files whenever the files prop changes
  useEffect(() => {
    console.log('Files prop changed:', files);
    if (Object.keys(files).length > 0) {
      setIsLoading(true);
      try {
        const converted = convertFilesToSandpack(files);
        console.log('Converted files for Sandpack:', converted);
        
        // Validate the converted files
        if (converted['/App.js'] && converted['/index.js']) {
          setSandpackFiles(converted);
          setHasError(false);
        } else {
          console.error('Conversion failed - missing required files');
          setHasError(true);
          setSandpackFiles(getTestFiles()); // Fallback to test files
        }
      } catch (error) {
        console.error('Error converting files:', error);
        setHasError(true);
        setSandpackFiles(getTestFiles()); // Fallback to test files
      } finally {
        setIsLoading(false);
      }
    } else {
      setSandpackFiles(getTestFiles());
      setIsLoading(false);
    }
  }, [files]);

  // Convert AI-generated files to Sandpack format
  const convertFilesToSandpack = (inputFiles) => {
    console.log('Converting files to Sandpack format...');
    
    const result = {};
    
    // Check if this looks like a Next.js app
    const isNextjsApp = Object.keys(inputFiles).some(path => 
      path.includes('app/page.') || path.includes('app/layout.')
    );

    if (isNextjsApp) {
      console.log('Detected Next.js structure, converting to React SPA');
      
      // Find the main page file
      const pageFile = Object.keys(inputFiles).find(path => 
        path.includes('app/page.js') || path.includes('app/page.jsx')
      );
      
      // Find CSS file
      const cssFile = Object.keys(inputFiles).find(path => 
        path.includes('globals.css') || path.includes('app.css') || path.endsWith('.css')
      );

      if (pageFile) {
        let appCode = inputFiles[pageFile];
        console.log('Original Next.js code:', appCode);
        
        // More careful cleanup of Next.js specific code
        // Remove Next.js imports
        appCode = appCode.replace(/import.*from\s+['"]next\/.*['"];?\n?/g, '');
        
        // Remove metadata exports
        appCode = appCode.replace(/export\s+const\s+metadata\s*=[\s\S]*?(?=\n\n|\nexport|\nfunction|\nconst|\nlet|\nvar|$)/g, '');
        
        // Handle different export patterns more carefully
        if (appCode.includes('export default function')) {
          // If it's already "export default function SomeName", rename to App
          appCode = appCode.replace(/export\s+default\s+function\s+\w+/g, 'export default function App');
        } else if (appCode.match(/function\s+\w+\s*\([^)]*\)\s*\{/)) {
          // If there's a named function, convert it to export default function App
          appCode = appCode.replace(/(function\s+)\w+(\s*\([^)]*\)\s*\{)/g, '$1App$2');
          if (!appCode.includes('export default')) {
            appCode = appCode.replace(/function\s+App/, 'export default function App');
          }
        } else if (appCode.match(/export\s+default\s+\w+/)) {
          // If it's "export default SomeName", replace with proper function
          const functionMatch = appCode.match(/const\s+(\w+)\s*=.*?=>/s) || appCode.match(/function\s+(\w+)/);
          if (functionMatch) {
            appCode = appCode.replace(/export\s+default\s+\w+/, 'export default App');
            appCode = appCode.replace(new RegExp(`(const\\s+|function\\s+)${functionMatch[1]}`, 'g'), '$1App');
          }
        }
        
        // Ensure we have a proper export default
        if (!appCode.includes('export default')) {
          appCode += '\n\nexport default App;';
        }
        
        // Clean up any double exports
        appCode = appCode.replace(/export\s+default\s+App\s*;\s*export\s+default\s+App\s*;/g, 'export default App;');
        
        console.log('Converted App code:', appCode);
        result['/App.js'] = appCode;
      }

      // Add CSS if found
      if (cssFile) {
        result['/App.css'] = inputFiles[cssFile];
        
        // Add CSS import to App.js if not already there
        if (result['/App.js'] && !result['/App.js'].includes('./App.css')) {
          result['/App.js'] = `import './App.css';\n${result['/App.js']}`;
        }
      }

      // Add any components
      Object.entries(inputFiles).forEach(([path, content]) => {
        if (path.includes('components/') && !path.includes('app/')) {
          // Convert path to relative format
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          result[cleanPath] = content;
        }
      });

    } else {
      // Handle as regular React files
      Object.entries(inputFiles).forEach(([path, content]) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        result[cleanPath] = content;
      });
    }

    // Ensure we have App.js - if conversion failed, create a simple fallback
    if (!result['/App.js'] || result['/App.js'].includes('export default App App')) {
      console.log('Creating fallback App.js due to conversion issues');
      result['/App.js'] = `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>Generated App</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Your AI-generated application!</p>
      <div style={{ 
        background: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '8px',
        border: '1px solid #d1d5db'
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
          The original code had some conversion issues, so this fallback is displayed.
          Try generating a simpler app or check the console for details.
        </p>
      </div>
    </div>
  );
}`;
    }

    // Ensure we have index.js entry point
    result['/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;

    console.log('Final converted files:', result);
    return result;
  };

  // Default test files
  const getTestFiles = () => ({
    '/App.js': `import React from 'react';

export default function App() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          🚀 AI App Builder
        </h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '2rem', opacity: 0.9 }}>
          Generate an app using the chat panel to see your code come to life here!
        </p>
        <div style={{ 
          background: 'rgba(255,255,255,0.15)', 
          padding: '30px', 
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>✨ This preview panel will show your generated app</p>
            <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>💻 Your code will be compiled in real-time</p>
            <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>🎨 Try describing any app you want to build!</p>
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.7,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '15px'
          }}>
            Examples: "Build a todo app", "Create a calculator", "Design a landing page"
          </div>
        </div>
      </div>
    </div>
  );
}`,
    '/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  });

  const ErrorFallback = () => (
    <div className="h-full flex items-center justify-center text-neutral-400 bg-neutral-900">
      <div className="text-center p-8">
        <Warning size={48} className="mx-auto mb-4 text-yellow-500" />
        <h3 className="text-lg font-medium mb-2 text-white">Preview Error</h3>
        <p className="text-sm mb-4">
          There was an issue compiling the preview.
        </p>
        <div className="space-y-2">
          <Button
            onClick={handleRefresh}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retry Preview
          </Button>
          <p className="text-xs text-neutral-500 mt-2">
            Check the browser console for details.
          </p>
        </div>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="h-full flex items-center justify-center text-neutral-400 bg-neutral-900">
      <div className="text-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-neutral-600 border-t-blue-600 rounded-full mx-auto mb-4"></div>
        <p className="text-sm">Loading preview...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-neutral-100">Live Preview</h3>
          
          {hasError && (
            <div className="flex items-center gap-1 text-yellow-500 text-xs">
              <Warning size={12} />
              <span>Error</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-1 text-blue-500 text-xs">
              <div className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full"></div>
              <span>Loading</span>
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex bg-neutral-900 rounded-lg p-1">
            <Button
              size="sm"
              variant="ghost"
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
              variant="ghost"
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
          disabled={isLoading}
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
          <div className="h-full border border-neutral-800 rounded-lg overflow-hidden bg-white">
            {isLoading ? (
              <LoadingState />
            ) : hasError ? (
              <ErrorFallback />
            ) : sandpackFiles ? (
              <Sandpack
                key={refreshKey}
                template="react"
                files={sandpackFiles}
                theme="dark"
                options={{
                  showNavigator: false,
                  showTabs: false,
                  showLineNumbers: false,
                  showInlineErrors: true,
                  showErrorOverlay: true,
                  wrapContent: true,
                  editorHeight: 0,
                  layout: 'preview',
                  autorun: true,
                  bundlerURL: undefined // Use default bundler
                }}
                customSetup={{
                  dependencies: {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0"
                  }
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 