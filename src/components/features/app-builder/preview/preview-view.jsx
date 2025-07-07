// src/components/features/app-builder/preview/PreviewView.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DeviceRotate } from "@phosphor-icons/react";

export function PreviewView({ files }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [srcDoc, setSrcDoc] = useState("");

  const rebuild = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    setSrcDoc(buildSrcDoc(files));
  }, [files, reloadKey]);

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Reload button */}
      <div className="p-2 border-b border-neutral-800 flex justify-end">
        <Button size="sm" variant="ghost" onClick={rebuild}>
          <DeviceRotate size={16} />
          <span className="sr-only">Reload Preview</span>
        </Button>
      </div>
      {/* Iframe preview */}
      <iframe
        title="Live Preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
        className="flex-1 w-full"
        style={{ border: 0 }}
      />
    </div>
  );
}

function buildSrcDoc(files = {}) {
  const head = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Live Preview</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React & ReactDOM UMD -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <!-- Expose React hooks as globals -->
  <script>
    window.useState = React.useState;
    window.useEffect = React.useEffect;
    window.useContext = React.useContext;
    window.useRef = React.useRef;
    window.useMemo = React.useMemo;
    window.useCallback = React.useCallback;
  </script>

  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    body { margin: 0; background: #111827; }
    #root { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="env,react">
    // Your components and page code follow
`;

  // 1) Inject any components/**
  let bundle = "";
  Object.entries(files).forEach(([rawPath, content]) => {
    const path = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    if (/^components\/.*\.(js|jsx)$/.test(path)) {
      // strip imports/exports
      const code = content
        .replace(/^import.*$/gm, "")
        .replace(/^export\s+default\s+function/m, "function")
        .replace(/^export\s+default\s+/m, "")
        .replace(/^export\s+function\s+/gm, "function ")
        .replace(/^export\s+(const|let|var)\s+/gm, "$1 ")
        .replace(/^export\s*{[^}]*}\s*;?$/gm, "")
        .replace(/<Image\b([^>]*)>/g, "<img$1 />")
        .replace(/<\/Image>/g, "")
        .trim();
      bundle += code + "\n\n";
    }
  });

  // 2) Inject app/page.js(x) → App
  let pageCode = `
function App() {
  return React.createElement(
    "div",
    { className: "flex items-center justify-center h-full text-white text-2xl" },
    "Please generate an app."
  );
}
`;
  const pageEntry = Object.entries(files).find(([p]) =>
    p.replace(/^\//, "").match(/^app\/page\.(js|jsx)$/),
  );
  if (pageEntry) {
    let code = pageEntry[1]
      .replace(/^import.*$/gm, "")
      .replace(/^export\s+default\s+function\s+\w+/m, "function App")
      .replace(/^export\s+default\s+/m, "")
      .replace(/<Image\b([^>]*)>/g, "<img$1 />")
      .replace(/<\/Image>/g, "")
      .trim();
    pageCode = code;
  }

  // 3) Render call
  const renderCode = `
ReactDOM.createRoot(document.getElementById("root"))
  .render(React.createElement(App));
`;

  const foot = `
    ${bundle}
    ${pageCode}
    ${renderCode}
  </script>
</body>
</html>
`;

  return head + foot;
}
