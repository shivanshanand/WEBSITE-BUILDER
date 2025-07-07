import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expert Next.js developer. Your task is to generate complete, production-ready Next.js applications based on user descriptions.

CRITICAL REQUIREMENTS:
1. Generate a complete file structure with proper Next.js 14 App Router structure
2. Include ALL necessary files: page.js, layout.js, components, styles, etc.
3. Use JavaScript (NOT TypeScript), Tailwind CSS, and modern React patterns
4. Ensure all code is functional and error-free
5. Include proper imports and exports
6. Use .js and .jsx file extensions only
7. Always include required configuration files for Next.js and Tailwind
8. NEVER use next/font/google or any external font imports - use system fonts only
9. NEVER include external scripts, analytics, or third-party CDN resources
10. Keep all resources local and self-contained

REQUIRED FILES TO INCLUDE:
- app/page.js (main page)
- app/layout.js (root layout)
- app/globals.css (styles)
- components/*.jsx (React components)
- package.json (dependencies)
- next.config.js (Next.js configuration)
- tailwind.config.js (Tailwind configuration)
- postcss.config.js (PostCSS configuration)

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "files": {
    "app/page.js": "file content here",
    "app/layout.js": "file content here",
    "app/globals.css": "file content here",
    "components/ComponentName.jsx": "file content here",
    "package.json": "file content here",
    "next.config.js": "file content here",
    "tailwind.config.js": "file content here",
    "postcss.config.js": "file content here"
  },
  "description": "Brief description of the generated app"
}

GUIDELINES:
- Use functional components with hooks
- Include responsive design with Tailwind CSS
- Use JavaScript only - no TypeScript syntax
- Include error boundaries where needed
- Make the UI modern and professional
- Include proper package.json with all dependencies (exclude TypeScript dependencies)
- Use .js for server components and utilities
- Use .jsx for React components
- Ensure all imports use correct file extensions
- Always include next.config.js with proper module.exports
- Always include tailwind.config.js with proper content paths
- Always include postcss.config.js with tailwindcss and autoprefixer
- Use ONLY system fonts (font-sans, font-serif, font-mono from Tailwind)
- NO external resources, Google Fonts, CDN links, or analytics scripts
- Keep everything self-contained for preview environments

FONT USAGE - ONLY SYSTEM FONTS:
Use Tailwind's font classes only:
- font-sans (system sans-serif)
- font-serif (system serif)
- font-mono (system monospace)

LAYOUT.JS TEMPLATE:
import './globals.css'

export const metadata = {
  title: 'App Title',
  description: 'App description',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

CONFIGURATION FILE TEMPLATES:

next.config.js:
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig

tailwind.config.js:
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

postcss.config.js:
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

Generate a complete, working Next.js JavaScript application based on the user's request.`;

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log("Raw AI response:", text);

    // Extract JSON from the response with better parsing
    let jsonText = "";

    // First try to find JSON in code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      // Try to find any JSON object in the text
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }

    if (!jsonText) {
      console.error("No JSON found in response:", text);
      throw new Error("No JSON object found in AI response");
    }

    let generatedCode;
    try {
      generatedCode = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("JSON text:", jsonText);
      throw new Error("Invalid JSON format in AI response");
    }

    // Validate the structure
    if (!generatedCode.files || typeof generatedCode.files !== "object") {
      throw new Error("Generated response missing valid files object");
    }

    if (Object.keys(generatedCode.files).length === 0) {
      throw new Error("Generated response contains no files");
    }

    // Ensure we have a description
    if (!generatedCode.description) {
      generatedCode.description = "Generated Next.js application";
    }

    console.log(
      "Successfully generated",
      Object.keys(generatedCode.files).length,
      "files",
    );

    return NextResponse.json({
      success: true,
      data: generatedCode,
    });
  } catch (error) {
    console.error("Error generating code:", error);
    return NextResponse.json(
      { error: "Failed to generate code", details: error.message },
      { status: 500 },
    );
  }
}
