
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
# 欢迎来到 DevBlog v2.0 🚀

这是一个设计成类似 IDE 风格的个人博客。

## 技术栈
- **框架**: React 18
- **样式**: Tailwind CSS
- **类型安全**: TypeScript
- **风格**: VS Code / Monokai / Cyberpunk

## 导航
使用左侧的 **Explorer** 浏览我的想法。
打开下方的 **Terminal** 运行系统命令。

### 最新更新
- 增加了中文本地化支持
- 实现了文件树递归渲染
- 增加了赛博朋克风格动效
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
  'post-react-hooks': {
    id: 'post-react-hooks',
    name: 'mastering-hooks.md',
    type: FileType.FILE,
    parentId: 'folder-posts',
    date: '2023-11-15',
    tags: ['react', 'frontend'],
    content: `
# 精通 React Hooks: 超越基础

Hooks 彻底改变了我们编写 React 的方式。但你真的在高效使用它们吗？

## 依赖数组的陷阱

我们都经历过 \`useEffect\` 的无限循环。

\`\`\`tsx
// 错误示范 ❌
useEffect(() => {
  fetchData();
}, [fetchData]); // 如果 fetchData 没有被 memoize，会导致无限循环

// 正确做法 ✅
const fetchData = useCallback(() => {
  // ...
}, [dependency]);

useEffect(() => {
  fetchData();
}, [fetchData]);
\`\`\`

## 自定义 Hooks
封装逻辑。如果你发现自己写了两次相同的 \`useEffect\`，请把它提取出来。

> "代码就像笑话。如果你必须解释它，那它就很烂。" - Cory House
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
# 可扩展的前端架构

目录不应该只是文件的堆砌，它们应该代表 **业务领域 (Domains)**。

## Feature-Sliced Design (FSD)?
对于一个小博客来说可能杀鸡用牛刀，但对于企业级应用至关重要。

1. **Shared**: 可复用的 UI 组件库
2. **Entities**: 业务逻辑 (User, Product)
3. **Features**: 用户交互 (AddToCart)
4. **Widgets**: 功能组合
5. **Pages**: 页面组合

保持组件纯净，副作用受控。
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
