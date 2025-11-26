import { FileSystem, FileType } from './types';

export const INITIAL_FILE_SYSTEM: FileSystem = {
  'root': {
    id: 'root',
    name: 'root',
    type: FileType.FOLDER,
    parentId: null,
    children: ['folder-src', 'folder-public', 'file-readme', 'file-config'],
    isOpen: true
  },
  'folder-src': {
    id: 'folder-src',
    name: 'src',
    type: FileType.FOLDER,
    parentId: 'root',
    children: ['folder-posts', 'folder-notes'],
    isOpen: true
  },
  'folder-public': {
    id: 'folder-public',
    name: 'public',
    type: FileType.FOLDER,
    parentId: 'root',
    children: ['file-resume'],
    isOpen: false
  },
  'folder-posts': {
    id: 'folder-posts',
    name: 'posts',
    type: FileType.FOLDER,
    parentId: 'folder-src',
    children: ['post-react-hooks', 'post-architecture'],
    isOpen: true
  },
  'folder-notes': {
    id: 'folder-notes',
    name: 'notes',
    type: FileType.FOLDER,
    parentId: 'folder-src',
    children: ['note-ideas'],
    isOpen: false
  },
  'file-readme': {
    id: 'file-readme',
    name: 'README.md',
    type: FileType.FILE,
    parentId: 'root',
    date: '2023-10-27',
    tags: ['system'],
    content: `
# Welcome to DevBlog v2.0 🚀

This is a personal blog engineered to feel like home.

## Tech Stack
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Vibe**: VS Code / Monokai

## Navigation
Use the **Explorer** on the left to navigate through my thoughts.
Open the **Terminal** below to run system commands.

### Latest Updates
- Added comprehensive support for \`react-markdown\`
- Implemented file tree recursion
`
  },
  'file-config': {
    id: 'file-config',
    name: 'package.json',
    type: FileType.FILE,
    parentId: 'root',
    tags: ['config'],
    content: `\`\`\`json
{
  "name": "developer-brain-dump",
  "version": "1.0.0",
  "description": "Thoughts compiled into code",
  "author": "Senior Engineer",
  "license": "MIT",
  "dependencies": {
    "coffee": "^2.0.0",
    "music": "latest",
    "sleep": "beta-feature"
  }
}
\`\`\``
  },
  'post-react-hooks': {
    id: 'post-react-hooks',
    name: 'mastering-hooks.md',
    type: FileType.FILE,
    parentId: 'folder-posts',
    date: '2023-11-15',
    tags: ['react', 'frontend'],
    content: `
# Mastering React Hooks: Beyond the Basics

Hooks changed the way we write React. But are you using them effectively?

## The Dependency Array Trap

We've all been there. Infinite loops in \`useEffect\`.

\`\`\`tsx
// Bad ❌
useEffect(() => {
  fetchData();
}, [fetchData]); // Infinite loop if fetchData isn't memoized

// Good ✅
const fetchData = useCallback(() => {
  // ...
}, [dependency]);

useEffect(() => {
  fetchData();
}, [fetchData]);
\`\`\`

## Custom Hooks
Encapsulate logic. If you find yourself writing the same \`useEffect\` twice, extract it.

> "Code is like humor. When you have to explain it, it’s bad." - Cory House
`
  },
  'post-architecture': {
    id: 'post-architecture',
    name: 'scalable-frontend.md',
    type: FileType.FILE,
    parentId: 'folder-posts',
    date: '2024-01-20',
    tags: ['architecture', 'design-patterns'],
    content: `
# Scalable Frontend Architecture

Directories shouldn't just be piles of files. They should represent **domains**.

## Feature-Sliced Design?
Maybe overkill for a blog, but essential for enterprise apps.

1. **Shared**: Reusable UI kits
2. **Entities**: Business logic (User, Product)
3. **Features**: User actions (AddToCart)
4. **Widgets**: Composition of features
5. **Pages**: Composition of widgets

Keep your components pure and your side-effects contained.
`
  },
  'file-resume': {
    id: 'file-resume',
    name: 'resume.txt',
    type: FileType.FILE,
    parentId: 'folder-public',
    date: '2024-02-01',
    tags: ['career'],
    content: `
SENIOR FRONTEND ENGINEER
------------------------
Passionate about pixels, performance, and developer experience.

EXPERIENCE:
- Built high-frequency trading dashboards.
- Optimized rendering performance by 300%.
- Led a team of 5 engineers.

SKILLS:
- TypeScript, React, Node.js, WebGL
`
  },
  'note-ideas': {
    id: 'note-ideas',
    name: 'scratchpad.md',
    type: FileType.FILE,
    parentId: 'folder-notes',
    date: '2024-02-10',
    tags: ['wip'],
    content: `
- [ ] Build a retro game emulator in WASM
- [ ] Write a blog post about Gemini API
- [x] Refactor the blog to look like an IDE
`
  }
};
