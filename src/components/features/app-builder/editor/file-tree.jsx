import { useState } from "react";
import {
  File,
  Folder,
  FolderOpen,
  CaretRight,
  CaretDown,
} from "@phosphor-icons/react";

export function FileTree({ files, activeFile, onFileSelect }) {
  const [expandedFolders, setExpandedFolders] = useState(
    new Set(["app", "components"]),
  );

  // Build tree structure from flat file list
  const buildTree = (files) => {
    const tree = {};

    Object.keys(files).forEach((filePath) => {
      const parts = filePath.split("/");
      let current = tree;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // This is a file
          current[part] = { type: "file", path: filePath };
        } else {
          // This is a folder
          if (!current[part]) {
            current[part] = { type: "folder", children: {} };
          }
          current = current[part].children;
        }
      });
    });

    return tree;
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop();
    return <File size={16} className="text-neutral-400" />;
  };

  const TreeNode = ({ name, node, path = "", level = 0 }) => {
    const fullPath = path ? `${path}/${name}` : name;
    const isExpanded = expandedFolders.has(fullPath);
    const isActive = activeFile === (node.type === "file" ? node.path : null);

    if (node.type === "file") {
      return (
        <div
          className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded transition-colors ${
            isActive
              ? "bg-blue-600 text-white"
              : "text-neutral-300 hover:bg-neutral-800"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onFileSelect(node.path)}
        >
          {getFileIcon(name)}
          <span className="text-sm font-mono truncate">{name}</span>
        </div>
      );
    }

    // This is a folder
    return (
      <div>
        <div
          className="flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded transition-colors text-neutral-300 hover:bg-neutral-800"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => toggleFolder(fullPath)}
        >
          {isExpanded ? (
            <CaretDown size={14} className="text-neutral-500" />
          ) : (
            <CaretRight size={14} className="text-neutral-500" />
          )}
          {isExpanded ? (
            <FolderOpen size={16} className="text-blue-400" />
          ) : (
            <Folder size={16} className="text-neutral-400" />
          )}
          <span className="text-sm font-medium">{name}</span>
        </div>
        {isExpanded && (
          <div>
            {Object.entries(node.children || {})
              .sort(([, a], [, b]) => {
                // Folders first, then files
                if (a.type !== b.type) {
                  return a.type === "folder" ? -1 : 1;
                }
                return 0;
              })
              .map(([childName, childNode]) => (
                <TreeNode
                  key={childName}
                  name={childName}
                  node={childNode}
                  path={fullPath}
                  level={level + 1}
                />
              ))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(files);

  return (
    <div className="p-2 h-full overflow-y-auto">
      <div className="mb-3 px-2 py-1">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Files
        </h3>
      </div>

      {Object.keys(tree).length === 0 ? (
        <div className="text-center text-neutral-500 py-8">
          <Folder size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">No files</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {Object.entries(tree)
            .sort(([, a], [, b]) => {
              // Folders first, then files
              if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
              }
              return 0;
            })
            .map(([name, node]) => (
              <TreeNode key={name} name={name} node={node} />
            ))}
        </div>
      )}
    </div>
  );
}
