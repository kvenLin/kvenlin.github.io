
import { FileSystem, FileType } from './types';
import packageJson from './package.json';

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
    children: ['folder-posts'],
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
${JSON.stringify(packageJson, null, 2)}
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
  }
};
