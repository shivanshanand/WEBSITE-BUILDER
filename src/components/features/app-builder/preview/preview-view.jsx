import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import {
  Monitor,
  DeviceMobile,
  DeviceRotate,
  Warning,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function PreviewView({ files }) {
  const [viewMode, setViewMode] = useState("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sandpackFiles, setSandpackFiles] = useState(null);
  const [status, setStatus] = useState("idle");

  const fallbackFiles = {
    "/app/page.js": `export default function Page() {
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: 16, fontWeight: 'bold' }}>🚀 AI App Builder</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: 32, opacity: 0.9 }}>Your Next.js app preview will appear here!</p>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
        <p style={{ margin: 0, fontSize: '1rem' }}>Generate an app using the chat panel to see it compiled with Next.js App Router</p>
      </div>
    </div>
  );
}`,
    "/app/layout.js": `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
    "/app/globals.css": `body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`,
  };

  function convertFiles(input) {
    if (!input || Object.keys(input).length === 0) return fallbackFiles;

    const result = {};

    Object.entries(input).forEach(([path, content]) => {
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      result[cleanPath] = content;
    });

    const hasPage = Object.keys(result).some((path) =>
      path.match(/\/app\/page\.(js|jsx|ts|tsx)$/),
    );
    const hasLayout = Object.keys(result).some((path) =>
      path.match(/\/app\/layout\.(js|jsx|ts|tsx)$/),
    );

    if (!hasPage) {
      result["/app/page.js"] = fallbackFiles["/app/page.js"];
    }

    if (!hasLayout) {
      result["/app/layout.js"] = fallbackFiles["/app/layout.js"];
    }

    if (!Object.keys(result).some((path) => path.includes("globals.css"))) {
      result["/app/globals.css"] = fallbackFiles["/app/globals.css"];
    }

    return result;
  }

  useEffect(() => {
    setStatus("loading");
    try {
      const converted = convertFiles(files);
      setSandpackFiles(converted);
      setStatus("idle");
      console.log("Next.js App Router files:", converted);
    } catch (e) {
      console.error("Error processing files:", e);
      setSandpackFiles(fallbackFiles);
      setStatus("error");
    }
  }, [files, refreshKey]);

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-neutral-100">
            Next.js Preview
          </h3>
          {status === "error" && (
            <div className="flex items-center gap-1 text-yellow-500 text-xs">
              <Warning size={12} />
              <span>Error</span>
            </div>
          )}
          {status === "loading" && (
            <div className="flex items-center gap-1 text-blue-500 text-xs">
              <div className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full"></div>
              <span>Loading</span>
            </div>
          )}
          <div className="flex bg-neutral-900 rounded-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("desktop")}
              className={`h-7 px-2 ${viewMode === "desktop" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              <Monitor size={14} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode("mobile")}
              className={`h-7 px-2 ${viewMode === "mobile" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-200"}`}
            >
              <DeviceMobile size={14} />
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="h-7 px-2 bg-transparent border-neutral-700 text-neutral-400 hover:bg-neutral-800"
          disabled={status === "loading"}
        >
          <DeviceRotate size={14} />
        </Button>
      </div>
      <div className="flex-1 p-4">
        <div
          className={`h-full mx-auto transition-all duration-300 ${viewMode === "mobile" ? "max-w-sm" : "w-full"}`}
        >
          <div className="h-full border border-neutral-800 rounded-lg overflow-hidden bg-white">
            <Sandpack
              key={refreshKey}
              template="nextjs"
              files={sandpackFiles || fallbackFiles}
              theme="dark"
              options={{
                showNavigator: false,
                showTabs: false,
                showLineNumbers: false,
                showInlineErrors: true,
                showErrorOverlay: true,
                wrapContent: true,
                editorHeight: 0,
                layout: "preview",
                autorun: true,
              }}
              customSetup={{
                dependencies: {
                  next: "^14.0.0",
                  react: "^18.2.0",
                  "react-dom": "^18.2.0",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 