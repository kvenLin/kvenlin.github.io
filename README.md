# DevBlog OS

<div align="center">
  <h3>一个极客风格的沉浸式个人博客系统</h3>
  <p>基于 React + TypeScript + Tailwind CSS 构建，模拟 IDE / 操作系统体验。</p>
</div>

---

![alt text](/public/img/image.png)

![alt text](/public/img/image-1.png)

## ✨ 核心特性

- **💻 沉浸式 IDE 体验**：模拟 VS Code 风格的文件资源管理器、编辑器和终端。
- **📝 Markdown 渲染**：支持 GFM (GitHub Flavored Markdown)、代码高亮、内联代码样式。
- **🎨 动态主题**：支持暗色/亮色模式切换，配备 CRT 扫描线与矩阵雨背景特效。
- **💬 Giscus 评论系统**：集成 GitHub Discussions 作为评论后端，支持无需登录查看评论。
- **⚡ 极速性能**：基于 Vite 构建，使用 Framer Motion 实现流畅的 UI 动画。
- **🔍 全局搜索**：内置命令面板 (Cmd/Ctrl + K) 快速搜索文章与文件。
- **📱 响应式设计**：完美适配桌面端与移动端设备。

## 🛠️ 技术栈

- **核心框架**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **图标**: [Lucide React](https://lucide.dev/)
- **Markdown**: [React Markdown](https://github.com/remarkjs/react-markdown) + [Remark GFM](https://github.com/remarkjs/remark-gfm)
- **评论**: [@giscus/react](https://giscus.app/)

## 🚀 本地运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/kvenLin/kvenlin.github.io.git
   cd kvenlin.github.io
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   访问 `http://localhost:3000` 查看效果。

## 📦 构建与部署

本项目配置了 GitHub Actions 自动部署到 GitHub Pages。

### 构建项目

```bash
npm run build
```

### GitHub Pages 部署配置

1. **Fork 或克隆本仓库**到你的 GitHub 账号下，仓库名建议为 `<username>.github.io`。

2. **启用 GitHub Pages**：
   - 进入仓库 **Settings** → **Pages**
   - **Source** 选择 **GitHub Actions**（非 "Deploy from a branch"）

3. **推送代码**到 `main` 分支，GitHub Actions 会自动构建并部署。

4. **访问网站**：部署完成后访问 `https://<username>.github.io`。

> ⚠️ 如果使用项目页面（非 `<username>.github.io`），需要修改 `vite.config.ts` 中的 `base` 为 `/<repo-name>/`。

---

## 🔧 自定义配置

### 1. 站点基础配置

修改 `src/config/site.ts` 文件：

```typescript
export const siteConfig: SiteMetadata = {
  title: "你的网站标题",
  description: "网站描述",
  url: "https://your-username.github.io",
  github: {
    repository_url: "https://github.com/your-username/your-repo",
    repository_name: "your-repo",
    owner_name: "your-username",
    owner_url: "https://github.com/your-username",
    // ... 其他 GitHub 相关链接
  },
  author: {
    name: "你的名字",
    email: "your@email.com",
    bio: "个人简介"
  }
};
```

### 2. 评论系统配置 (Giscus)

本项目使用 [Giscus](https://giscus.app/) 作为评论系统，基于 GitHub Discussions。

#### 步骤 1：启用 GitHub Discussions

1. 进入你的仓库 **Settings** → **General** → **Features**
2. 勾选 **Discussions**

#### 步骤 2：安装 Giscus App

访问 [github.com/apps/giscus](https://github.com/apps/giscus) 并安装到你的仓库。

#### 步骤 3：获取配置参数

1. 访问 [giscus.app](https://giscus.app/zh-CN)
2. 输入你的仓库名（如 `your-username/your-repo`）
3. 选择 Discussion 分类（推荐 `Announcements`）
4. 复制生成的 `data-repo-id` 和 `data-category-id`

#### 步骤 4：更新评论组件

修改 `components/Comments.tsx` 中的配置：

```typescript
<Giscus
  repo="your-username/your-repo"
  repoId="你的 repo ID"           // 从 giscus.app 获取
  category="Announcements"
  categoryId="你的 category ID"   // 从 giscus.app 获取
  // ... 其他配置保持不变
/>
```

### 3. 文章管理

文章位于 `posts/` 目录下，使用 Markdown 格式，支持 Frontmatter 元数据：

```markdown
---
title: 文章标题
date: 2025-01-01
categories: [技术, 前端]
tags: [React, TypeScript]
---

正文内容...
```

| 字段 | 说明 | 必填 |
|------|------|------|
| `title` | 文章标题 | ✅ |
| `date` | 发布日期 (YYYY-MM-DD) | ✅ |
| `categories` | 分类列表 | ❌ |
| `tags` | 标签列表 | ❌ |

### 4. 快速创建文章 (CLI)

本项目提供了一个类似于 Hexo 的命令行工具，用于快速创建新文章。

```bash
npm run new "文章标题"
```

**功能说明**：
1.  自动在 `posts/` 目录下生成 Markdown 文件。
2.  文件名格式：`YYYY-MM-DD-文章标题.md`。
3.  自动填充 Frontmatter（标题、日期、标签等）和初始内容。
4.  文件生成后，启动项目即可在列表中看到并进行编辑。

---

## 📁 项目结构

```
├── components/          # React 组件
│   ├── Comments.tsx     # Giscus 评论组件
│   ├── EditorArea.tsx   # 编辑器主区域
│   ├── FileExplorer.tsx # 文件资源管理器
│   └── ...
├── posts/               # 博客文章 (Markdown)
├── src/
│   ├── config/
│   │   └── site.ts      # 站点配置文件
│   └── ...
├── utils/
│   └── postLoader.ts    # 文章加载器
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions 部署配置
└── vite.config.ts       # Vite 构建配置
```

---

## 📄 License

MIT License © 2025 [Kven Lin](https://github.com/kvenLin)
