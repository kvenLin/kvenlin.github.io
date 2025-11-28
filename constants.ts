
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
# Loading DevBlog OS...

Initializing system components...
Reading system documentation...

> If this message persists, please check your connection or system integrity.
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
  "version": "2.0.4",
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
  'file-resume': {
    id: 'file-resume',
    name: 'resume.md',
    type: FileType.FILE,
    parentId: 'folder-public',
    date: '2024-02-01',
    tags: ['career'],
    content: `
高级前端工程师
------------------------
热衷于像素级还原、性能优化和开发者体验。

工作经历:
- 构建高频交易仪表盘
- 将渲染性能优化了 300%
- 领导 5 人的工程师团队

技能:
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
- [ ] 用 WASM 构建一个复古游戏模拟器
- [ ] 写一篇关于 Gemini API 的博客
- [x] 重构博客以看起来像一个 IDE
- [x] 添加中文语言支持
`
  }
};
