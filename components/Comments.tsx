import React from 'react';
import Giscus from '@giscus/react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '../src/config/site';

interface CommentsProps {
  term: string; // 文章标识符，如文件名或 post id
}

/**
 * Giscus 评论组件
 * 
 * 使用 GitHub Discussions 作为评论后端
 * 用户需要用 GitHub 账号登录才能发表评论
 * 
 * 配置步骤：
 * 1. 在 GitHub 仓库 Settings → Features 中启用 Discussions
 * 2. 安装 Giscus App: https://github.com/apps/giscus
 * 3. 访问 https://giscus.app 获取 repoId 和 categoryId
 * 4. 更新下方配置
 */
export const Comments: React.FC<CommentsProps> = ({ term }) => {
  // 从 site config 获取仓库信息
  const repoFullName = `${siteConfig.github.owner_name}/${siteConfig.github.repository_name}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-16 pt-8 border-t border-white/10"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <MessageCircle size={18} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-200">评论区</h3>
          <p className="text-xs text-gray-500">使用 GitHub 账号登录后可发表评论</p>
        </div>
      </div>

      {/* Giscus Container */}
      <div className="giscus-container rounded-xl overflow-hidden bg-black/20 border border-white/5 p-4">
        <Giscus
          repo={repoFullName as `${string}/${string}`}
          repoId="R_kgDOQddnOQ" // TODO: 替换为你的 repoId，从 giscus.app 获取
          category="Announcements"
          categoryId="DIC_kwDOQddnOc4CzJfK" // TODO: 替换为你的 categoryId，从 giscus.app 获取
          mapping="specific"
          term={term}
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="transparent_dark"
          lang="zh-CN"
          loading="lazy"
        />
      </div>

      {/* Info Footer */}
      <div className="mt-4 text-center">
        <a 
          href={siteConfig.github.issues_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
        >
          评论由 GitHub Discussions 提供支持 →
        </a>
      </div>
    </motion.div>
  );
};

export default Comments;
