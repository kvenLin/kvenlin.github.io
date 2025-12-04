
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get title & optional args from command line arguments
const args = process.argv.slice(2);

const parseCliArgs = (rawArgs) => {
  const titleParts = [];
  let categoriesInput = '';

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg === '--categories' || arg === '-c') {
      categoriesInput = rawArgs[i + 1] || '';
      i += 1;
      continue;
    }

    if (arg.startsWith('--categories=')) {
      categoriesInput = arg.split('=').slice(1).join('=');
      continue;
    }

    titleParts.push(arg);
  }

  return {
    title: titleParts.join(' ').trim(),
    categoriesInput: categoriesInput.trim()
  };
};

const { title, categoriesInput } = parseCliArgs(args);

if (!title) {
  console.error('Error: Please provide a post title.');
  console.error('Usage: npm run new "My New Post" -- --categories "教程/github"');
  process.exit(1);
}

// Format date
const date = new Date();
const dateStr = date.toISOString().split('T')[0];

// Format filename: YYYY-MM-DD-title-slug.md
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // Keep Chinese characters and alphanumeric
  .replace(/^-+|-+$/g, '');

const sanitizeSegment = (segment) =>
  segment
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .trim();

const categorySegments = categoriesInput
  ? categoriesInput.split('/').map(seg => sanitizeSegment(seg)).filter(Boolean)
  : [];

const filename = `${dateStr}-${slug}.md`;
const targetDir = path.resolve(__dirname, '../posts', ...categorySegments);
const targetPath = path.join(targetDir, filename);

// Create directory if not exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Check if file already exists
if (fs.existsSync(targetPath)) {
  console.error(`Error: File ${filename} already exists.`);
  process.exit(1);
}

// Create content with frontmatter
const formatList = (items, fallback) => {
  const source = items.length ? items : [fallback];
  return source.map(item => `  - ${item}`).join('\n');
};

const categoryList = categorySegments.length ? [categorySegments.join('/')] : [];

const content = `---
title: ${title}
date: ${dateStr}
tags: 
  - draft
categories: 
${formatList(categoryList, 'General')}
---

Write your content here...
`;

// Write file
try {
  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`\n✅ Post created successfully!`);
  console.log(`📄 File: ${filename}`);
  console.log(`📂 Path: ${targetPath}`);
  if (categoryList.length) {
    console.log(`🗂️  Categories: ${categoryList[0]}`);
  } else {
    console.log('🗂️  Categories: General');
  }
  console.log();
} catch (error) {
  console.error('Error creating post:', error);
  process.exit(1);
}
