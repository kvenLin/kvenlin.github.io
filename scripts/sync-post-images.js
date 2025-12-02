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

const getExistingImageNames = () => {
  if (!fs.existsSync(PUBLIC_IMG_DIR)) return new Set();
  return new Set(
    fs.readdirSync(PUBLIC_IMG_DIR).map(name => name.toLowerCase())
  );
};

const getUniqueTargetName = (filename, existingNames) => {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const timestamp = Date.now();
  let candidate = `${base}-${timestamp}${ext}`;
  let counter = 1;

  while (existingNames.has(candidate.toLowerCase())) {
    candidate = `${base}-${timestamp}-${counter}${ext}`;
    counter += 1;
  }

  existingNames.add(candidate.toLowerCase());
  return candidate;
};

const moveImagesFromPosts = (existingNames) => {
  const moved = [];
  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });

  entries.forEach(entry => {
    if (!entry.isFile()) return;

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return;

    const sourcePath = path.join(POSTS_DIR, entry.name);
    const targetName = getUniqueTargetName(entry.name, existingNames);
    const targetPath = path.join(PUBLIC_IMG_DIR, targetName);

    fs.copyFileSync(sourcePath, targetPath);
    fs.unlinkSync(sourcePath);

    const renamed = targetName !== entry.name;
    console.log(
      renamed
        ? `📁 Copied ${entry.name} -> public/img/${targetName}`
        : `📁 Copied ${entry.name} -> public/img`
    );

    moved.push({ original: entry.name, newName: targetName });
  });

  return moved;
};

const updateMarkdownReferences = (movedImages) => {
  const updatedFiles = [];
  const renameMap = movedImages.reduce((acc, item) => {
    acc[item.original] = item.newName;
    return acc;
  }, {});
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
      const mappedName = renameMap[cleanName] || cleanName;
      const newUrl = `${SITE_BASE}/img/${mappedName}`;
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
  const existingNames = getExistingImageNames();
  const movedImages = moveImagesFromPosts(existingNames);
  const touchedMarkdown = updateMarkdownReferences(movedImages);

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
