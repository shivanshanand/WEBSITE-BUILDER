## Quick Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with:

```bash
# Gemini API Key (required for code generation)
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# NextAuth Configuration (already configured)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth (already configured)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### 2. Run the Application
```bash
bun dev
```

### 3. Test the Workflow
1. Enter a prompt like "Build a modern landing page with hero section"
2. Watch as the AI generates a complete Next.js app
3. See the 2-panel interface: AI Chat (left) ↔ Code/Preview Toggle (right)
4. Toggle between Code view (file tree + editor) and Live Preview (Sandpack)
5. Edit code in Monaco editor and see real-time updates

---

## 4-Day Hackathon Development Plan

### Day 1: Authentication & Core Setup

**Morning (4 hours)**

- Set up Next.js project with TypeScript + Tailwind
- Implement GitHub OAuth using NextAuth.js
- Create basic 3-panel layout (prompt → code → preview)
- Set up environment variables and basic routing

**Afternoon (4 hours)**

- Design clean UI with proper spacing and dark theme
- Create prompt input form with textarea and generate button
- Add loading states and basic error handling
- Set up database schema for user sessions (optional, can use localStorage)

### Day 2: LLM Integration & Code Generation

**Morning (4 hours)**

- Integrate Gemini API with a well-crafted system prompt
- Create prompt engineering for Next.js app generation
- Generate proper file structure: `app/page.tsx`, `components/`, `tailwind.config.js`, etc.
- Test with 3-4 different website types (landing, portfolio, dashboard, blog)

**Afternoon (4 hours)**

- Build file tree component to display generated structure
- Integrate Monaco Editor for code viewing/editing
- Create tabs for switching between files
- Add syntax highlighting and basic TypeScript support

### Day 3: Live Preview & Code Editing

**Morning (4 hours)**

- **Use Sandpack for live preview** (saves massive development time)
- Configure Sandpack with Next.js template
- Pass generated code to Sandpack for instant preview
- Add responsive preview (mobile/desktop toggle)

**Afternoon (4 hours)**

- Connect Monaco Editor changes to Sandpack
- Add auto-save functionality
- Implement real-time preview updates
- Add error boundaries and fallback states

### Day 4: Deployment Features

**Morning (4 hours)**

- Build ZIP download functionality (JSZip library)
- Create proper Next.js project structure for download
- Add GitHub repo creation using GitHub API
- Test repository creation with generated code

**Afternoon (4 hours)**

- Implement Vercel deployment using Vercel API
- Add deployment status tracking
- Create success/failure states with proper URLs
- Final UI polish and bug fixes

## Technical Stack Recommendations

### Core Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js** for GitHub OAuth
- **Sandpack** for live preview (critical time-saver)

### Key Libraries

- **Monaco Editor** - Code editing
- **JSZip** - ZIP file generation
- **Octokit** - GitHub API integration
- **@vercel/sdk** - Vercel deployment
- **Zustand** - Simple state management

### APIs Needed

- **OpenAI API** - Code generation
- **GitHub API** - Repository creation
- **Vercel API** - Deployment

## Critical Time-Saving Decisions

### 1. Use Sandpack Instead of Custom Compilation

- Sandpack handles all bundling, preview, and hot reload
- Saves 1-2 days of complex browser compilation work
- Just feed it the generated code and it works

### 2. Focus on 3 Website Templates

- Landing page with hero section
- Portfolio with projects grid
- Simple blog layout
- Don't try to handle every possible website type

### 3. Simple File Structure

```
generated-app/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── [generated-components]
├── package.json
└── tailwind.config.js
```

### 4. Pre-built System Prompts

Create 3-4 optimized prompts for different website types instead of trying to handle any prompt.

## Demo Flow for Judges

### 1. Show Authentication

- "Users sign in with GitHub for seamless deployment"

### 2. Demonstrate Generation

- Use prepared prompts: "Create a modern SaaS landing page with hero section, features grid, and pricing table"
- Show real-time code generation

### 3. Show Live Preview

- Highlight instant preview with Sandpack
- Demo responsive design toggle

### 4. Demonstrate Editing

- Make a color change in Monaco Editor
- Show it update in real-time

### 5. Show Deployment Options

- Download ZIP file
- Create GitHub repository
- Deploy to Vercel with live URL

## UI/UX Priorities

### Must-Have for Demo

- Clean, modern interface
- Smooth loading animations
- Professional code editor feel
- Responsive preview
- Clear deployment success states

### Nice-to-Have

- Dark/light theme toggle
- Keyboard shortcuts
- Code formatting
- Error highlighting

## Risk Mitigation

### Technical Risks

- **API rate limits**: Implement proper error handling
- **Sandpack issues**: Have fallback static preview
- **Deployment failures**: Show clear error messages

### Time Risks

- **Scope creep**: Stick to core 3 deployment options
- **Over-engineering**: Use libraries instead of building from scratch
- **API integration**: Test early and often

This plan prioritizes working functionality over perfection, which is ideal for a hackathon environment. The key is using Sandpack for preview and focusing on a polished demo flow.
