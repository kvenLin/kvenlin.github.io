
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get title from command line arguments
const args = process.argv.slice(2);
const title = args.join(' ');

if (!title) {
  console.error('Error: Please provide a post title.');
  console.error('Usage: npm run new "My New Post"');
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

const filename = `${dateStr}-${slug}.md`;
const targetDir = path.resolve(__dirname, '../posts');
const targetPath = path.join(targetDir, filename);

// Create directory if not exists (though it should exist)
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Check if file already exists
if (fs.existsSync(targetPath)) {
  console.error(`Error: File ${filename} already exists.`);
  process.exit(1);
}

// Create content with frontmatter
const content = `---
title: ${title}
date: ${dateStr}
tags: 
  - draft
categories: 
  - General
---

Write your content here...
`;

// Write file
try {
  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`\n✅ Post created successfully!`);
  console.log(`📄 File: ${filename}`);
  console.log(`📂 Path: ${targetPath}\n`);
} catch (error) {
  console.error('Error creating post:', error);
  process.exit(1);
}
