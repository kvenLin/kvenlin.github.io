---
title: 精通 React Hooks: 超越基础
date: 2023-11-15
categories: [frontend, react, archer]
tags: [react, frontend, test]
layout: post
---

# 精通 React Hooks: 超越基础

Hooks 彻底改变了我们编写 React 的方式。但你真的在高效使用它们吗？

## 依赖数组的陷阱

我们都经历过 `useEffect` 的无限循环。

```tsx
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
```

## 自定义 Hooks
封装逻辑。如果你发现自己写了两次相同的 `useEffect`，请把它提取出来。

> "代码就像笑话。如果你必须解释它，那它就很烂。" - Cory House
