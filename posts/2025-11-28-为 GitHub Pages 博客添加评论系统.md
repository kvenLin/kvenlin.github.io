---
title: 为 GitHub Pages 博客添加评论系统：从 Gitment 到 Giscus
date: 2025-11-28
categories: [tutorial, github]
tags: [github-pages, comments, giscus, gitment]
layout: post
---

# 为 GitHub Pages 博客添加评论系统

GitHub Pages 是一个纯静态托管服务，本身不支持后端功能，这意味着传统的评论系统（如 WordPress 内置评论）无法直接使用。但这并不意味着我们的技术博客就不能有评论功能！

## 静态博客评论方案对比

### 1. Disqus（第三方服务）

最早的静态博客评论方案，但存在以下问题：
- 加载速度慢，体积大
- 有广告（免费版）
- 数据存储在第三方
- 隐私问题

### 2. Gitment（GitHub Issues）

由 [imsun](https://github.com/imsun/gitment) 开发的开源评论系统，**核心思想**是利用 GitHub Issues 作为评论存储：

```
用户评论 → GitHub OAuth 登录 → 创建/回复 Issue → 显示在博客
```

**优点**：
- 数据存储在自己的 GitHub 仓库
- 访客只需 GitHub 账号即可评论
- 非常适合技术博客的受众

**缺点**：
- 项目已不再维护（最后更新 2017 年）
- 需要手动初始化每篇文章的 Issue

### 3. Utterances（GitHub Issues，推荐）

Gitment 的精神继承者，更轻量、更现代：

```tsx
<script src="https://utteranc.es/client.js"
        repo="owner/repo"
        issue-term="pathname"
        theme="github-dark"
        crossorigin="anonymous"
        async>
</script>
```

**优点**：
- 无广告、开源、轻量（~6KB）
- 自动创建 Issue
- 多种主题支持

### 4. Giscus（GitHub Discussions，最推荐）

基于 GitHub Discussions 而非 Issues，是目前**最推荐**的方案：

**为什么选择 Giscus？**

- ✅ 基于 GitHub Discussions，语义更清晰（Discussions 本就是讨论区）
- ✅ 支持回复嵌套、表情反应
- ✅ 多种主题，支持自定义 CSS
- ✅ 懒加载，性能优秀
- ✅ 积极维护中

## 技术原理解析

以 Giscus 为例，整个流程如下：

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览博客                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│         Giscus 组件加载，根据页面 URL 查询对应 Discussion │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                GitHub Discussions API                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Discussion: "posts/2024-05-28-comments.md"     │    │
│  │  ├── Comment 1: "Great article!"               │    │
│  │  │   └── Reply: "Thanks!"                      │    │
│  │  └── Comment 2: "Very helpful"                 │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              渲染评论列表 + 评论输入框                    │
│         用户通过 GitHub OAuth 登录后可发表评论           │
└─────────────────────────────────────────────────────────┘
```

## 在 React 项目中集成 Giscus

### 步骤 1：配置 GitHub 仓库

1. 进入仓库 Settings → General → Features
2. 勾选 **Discussions**
3. 访问 [giscus.app](https://giscus.app/zh-CN) 生成配置

### 步骤 2：安装 Giscus React 组件

```bash
npm install @giscus/react
```

### 步骤 3：创建评论组件

```tsx
import Giscus from '@giscus/react';

interface CommentsProps {
  term: string; // 文章标识符，如文件名
}

export const Comments: React.FC<CommentsProps> = ({ term }) => {
  return (
    <Giscus
      repo="your-username/your-repo"
      repoId="你的 repo ID"
      category="Announcements"
      categoryId="你的 category ID"
      mapping="specific"
      term={term}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="transparent_dark"
      lang="zh-CN"
      loading="lazy"
    />
  );
};
```

### 步骤 4：在文章页面使用

```tsx
<article>
  <ReactMarkdown>{content}</ReactMarkdown>
  
  {/* 评论区 */}
  <Comments term={postId} />
</article>
```

## 配置参数说明

| 参数 | 说明 |
|------|------|
| `repo` | GitHub 仓库，格式：`owner/repo` |
| `repoId` | 仓库 ID，从 giscus.app 获取 |
| `category` | Discussions 分类名称 |
| `categoryId` | 分类 ID，从 giscus.app 获取 |
| `mapping` | 页面与 Discussion 的映射方式 |
| `theme` | 主题，支持 `dark`, `light`, `transparent_dark` 等 |

## 最佳实践

1. **懒加载**：评论组件设置 `loading="lazy"`，避免影响首屏性能
2. **主题适配**：根据博客主题选择合适的 Giscus 主题
3. **语言设置**：设置 `lang` 与博客语言一致
4. **分类管理**：为博客评论创建专门的 Discussions 分类

## 总结

| 方案 | 推荐度 | 维护状态 | 特点 |
|------|--------|----------|------|
| Disqus | ⭐⭐ | 活跃 | 商业化，有广告 |
| Gitment | ⭐⭐ | 停止 | 开创性方案 |
| Utterances | ⭐⭐⭐⭐ | 活跃 | 轻量，基于 Issues |
| **Giscus** | ⭐⭐⭐⭐⭐ | 活跃 | 最推荐，基于 Discussions |

对于技术博客来说，**Giscus** 是目前最佳选择。它完美利用了 GitHub 生态，让评论管理变得简单，同时保证了数据的安全性和可控性。

---

> 本博客已集成 Giscus 评论系统，欢迎在下方留言讨论！
