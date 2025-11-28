---
title: 可扩展的前端架构
date: 2024-01-20
categories: [architecture]
tags: [architecture, design-patterns]
layout: post
---

# 可加载的前端架构

目录不应该只是文件的堆砌，它们应该代表 **业务领域 (Domains)**。

## Feature-Sliced Design (FSD)?
对于一个小博客来说可能杀鸡用牛刀，但对于企业级应用至关重要。

1. **Shared**: 可复用的 UI 组件库
2. **Entities**: 业务逻辑 (User, Product)
3. **Features**: 用户交互 (AddToCart)
4. **Widgets**: 功能组合
5. **Pages**: 页面组合

保持组件纯净，副作用受控。
