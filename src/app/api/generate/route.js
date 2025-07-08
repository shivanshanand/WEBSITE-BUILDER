// src/app/api/generate/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getOrCreateDefaultConversation,
  createMessage,
  getConversationById,
  updateConversationTitle,
  createConversation,
} from "@/lib/user-service";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are an expert Next.js developer. Your task is to generate complete,
production-ready Next.js applications based on user descriptions.

CRITICAL REQUIREMENTS:
1. Generate a complete file structure with proper Next.js 14 App Router
2. Use only JavaScript (no TypeScript)
3. Use Tailwind CSS for styling
4. Create modern, responsive, and professional designs
5. Include proper component structure and organization
6. Use semantic HTML and accessibility best practices
7. Generate clean, readable, and well-commented code
8. Include proper package.json with required dependencies
9. Create production-ready configuration files
10. Keep all resources local and self-contained

REQUIRED FILES TO INCLUDE:
- app/page.js, app/layout.js, app/globals.css, components/*.jsx,
  package.json, next.config.js, tailwind.config.js, postcss.config.js

RESPONSE FORMAT:
Return exactly this JSON structure and NOTHING else:
{
  "files": { 
    "app/page.js": "// Main page content",
    "app/layout.js": "// Root layout",
    "app/globals.css": "/* Global styles */",
    "components/[ComponentName].jsx": "// Component code",
    "package.json": "// Package configuration",
    "next.config.js": "// Next.js config",
    "tailwind.config.js": "// Tailwind config",
    "postcss.config.js": "// PostCSS config"
  },
  "description": "Professional, concise description of the generated application"
}

DESIGN GUIDELINES:
- Create modern, professional UI designs
- Use appropriate color schemes and typography
- Implement responsive layouts that work on all devices
- Include proper spacing, shadows, and visual hierarchy
- Use Tailwind's utility classes effectively
- Create intuitive user experiences
- JS only (no TS)
- Tailwind CSS + system fonts
- No external scripts or CDN resources
`;

const UPDATE_SYSTEM_PROMPT = `
You are an expert Next.js developer. The user already has a generated
Next.js codebase (in pure JSON). NOW THEY WANT SPECIFIC CHANGES.

IMPORTANT:
- IGNORE any instructions about “generating complete apps from scratch.”
- ONLY modify the files the user requests.
- RETURN exactly this JSON and NOTHING else:
  {
    "files": { /* ONLY changed files */ },
    "description": "Brief update description"
  }
- DO NOT wrap in markdown or add commentary.
`;

async function callGeminiWithRetry(prompt, maxRetries = 3) {
  let lastErr;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const resp = await result.response;
      return await resp.text();
    } catch (err) {
      lastErr = err;
      if (i === maxRetries) break;
      await new Promise((r) => setTimeout(r, i * i * 500));
    }
  }
  throw lastErr;
}

function extractJSONCandidates(text) {
  let t = text.trim().replace(/```(?:json)?/gi, "").replace(/```/g, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  return start >= 0 && end >= 0 ? t.slice(start, end + 1) : null;
}

function findLastJSON(history) {
  if (!Array.isArray(history)) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role !== "assistant" || !msg.content) continue;
    
    try {
      // Try to parse as structured assistant message
      const parsed = JSON.parse(msg.content);
      if (parsed.files && typeof parsed.files === "object") {
        return JSON.stringify(parsed.files);
      }
    } catch {
      // If it's not JSON, try to extract JSON from text (backward compatibility)
      const candidate = extractJSONCandidates(msg.content);
      if (!candidate) continue;
      try {
        const parsed = JSON.parse(candidate);
        if (parsed.files && typeof parsed.files === "object") {
          return candidate;
        }
      } catch {}
    }
  }
  return null;
}

export async function POST(request) {
  try {
    // 1) Authenticate
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse input
    const { prompt, history, conversationId } = await request.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // 3) Get conversation - NEVER create new conversation when conversationId is provided
    let convo;
    if (conversationId) {
      try {
        convo = await getConversationById(conversationId);
        if (!convo) {
          return NextResponse.json(
            { error: "Conversation not found" },
            { status: 404 }
          );
        }
        if (convo.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Unauthorized access to conversation" },
            { status: 403 }
          );
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json(
          { error: "Failed to fetch conversation" },
          { status: 500 }
        );
      }
    } else {
      // Only create new conversation if no conversationId provided (shouldn't happen in normal flow)
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // 4) Determine initial vs update
    const prevJSON = findLastJSON(history);
    const isUpdate = Boolean(prevJSON);
    const systemPrompt = isUpdate ? UPDATE_SYSTEM_PROMPT : SYSTEM_PROMPT;

    // 5) Build the final prompt
    let fullPrompt = systemPrompt + "\n\n";
    if (isUpdate) {
      fullPrompt += `Current codebase JSON:\n${prevJSON}\n\n`;
    }
    fullPrompt += `User Request: ${prompt}`;

    // 6) Persist user message
    await createMessage(convo.id, "USER", prompt);

    // 7) Auto-update conversation title if it's still "New Chat" and this is the first user message
    if (convo.title === "New Chat" || convo.title === null) {
      const titlePrompt = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;
      await updateConversationTitle(convo.id, titlePrompt);
    }

    // 8) Call Gemini
    const aiText = await callGeminiWithRetry(fullPrompt, 3);

    // 9) Extract & parse JSON
    const jsonText = extractJSONCandidates(aiText);
    if (!jsonText) {
      console.error("No JSON found in AI response:", aiText);
      throw new Error("No JSON object found in AI response");
    }
    let payload;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      console.error("JSON parse error:", jsonText);
      throw new Error("Invalid JSON format in AI response");
    }
    if (!payload.files || typeof payload.files !== "object") {
      throw new Error("Response missing valid files object");
    }
    if (!payload.description) {
      payload.description = isUpdate
        ? "Updated Next.js application files"
        : "Generated Next.js application";
    }

    // 10) Persist assistant message (store structured data for proper conversation continuity)
    const assistantMessage = {
      description: payload.description,
      files: payload.files,
      isUpdate: isUpdate
    };
    await createMessage(convo.id, "ASSISTANT", JSON.stringify(assistantMessage));

    // 11) Return generated payload with files for the UI
    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      { error: "Generation failed", details: error.message },
      { status: 500 }
    );
  }
}