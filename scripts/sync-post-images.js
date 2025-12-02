import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_BASE = 'https://kvenlin.github.io';
const POSTS_DIR = path.resolve(__dirname, '../posts');
const PUBLIC_IMG_DIR = path.resolve(__dirname, '../public/img');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

const ensureDirectories = () => {
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(`Posts directory not found: ${POSTS_DIR}`);
  }
  fs.mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
};

const moveImagesFromPosts = () => {
  const moved = [];
  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });

  entries.forEach(entry => {
    if (!entry.isFile()) return;

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return;

    const sourcePath = path.join(POSTS_DIR, entry.name);
    const targetPath = path.join(PUBLIC_IMG_DIR, entry.name);

    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`📁 Copied ${entry.name} -> public/img`);
    } else {
      console.log(`ℹ️  ${entry.name} already exists in public/img, skipping copy.`);
    }

    fs.unlinkSync(sourcePath);
    moved.push(entry.name);
  });

  return moved;
};

const updateMarkdownReferences = () => {
  const updatedFiles = [];
  const mdFiles = fs.readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => entry.name);

  const imageLinkRegex = /(!\[[^\]]*\]\()([^ )]+?\.(?:png|jpg|jpeg|gif|webp|svg))([^)]*)\)/gi;

  mdFiles.forEach(filename => {
    const filePath = path.join(POSTS_DIR, filename);
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    let updated = false;

    const newContent = originalContent.replace(imageLinkRegex, (match, prefix, url, suffix) => {
      if (/^https?:\/\//i.test(url)) return match;

      const cleanName = path.basename(url);
      const newUrl = `${SITE_BASE}/img/${cleanName}`;
      updated = true;
      return `${prefix}${newUrl}${suffix})`;
    });

    if (updated) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      updatedFiles.push(filename);
      console.log(`✏️  Updated image links in ${filename}`);
    }
  });

  return updatedFiles;
};

const main = () => {
  ensureDirectories();
  const movedImages = moveImagesFromPosts();
  const touchedMarkdown = updateMarkdownReferences();

  console.log('\n✅ Image sync complete.');
  console.log(`📦 Images moved: ${movedImages.length}`);
  console.log(`📝 Markdown updated: ${touchedMarkdown.length}`);
};

try {
  main();
} catch (error) {
  console.error('❌ Failed to sync post images:', error);
  process.exit(1);
}
