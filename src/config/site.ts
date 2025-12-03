export interface SiteMetadata {
  title: string;
  description: string;
  baseurl: string;
  url: string;
  github: {
    is_project_page: boolean;
    repository_url: string;
    repository_name: string;
    owner_name: string;
    owner_url: string;
    issues_url: string;
    wiki_url: string;
    pages_url: string;
    contributors: Array<{
      name: string;
      url: string;
      avatar?: string;
    }>;
  };
  build: {
    timestamp: string;
    version: string;
    node_version: string;
  };
  author: {
    name: string;
    email: string;
    bio: string;
    avatar?: string;
  };
  projects: Array<{
    name: string;
    description: string;
    url: string;
  }>;
}

export const siteConfig: SiteMetadata = {
  title: "KvenLin's Dev Space",
  description: "Pixel-perfect frontend engineering & system architecture.",
  baseurl: "",
  url: "https://kvenlin.github.io",
  github: {
    is_project_page: false,
    repository_url: "https://github.com/kvenLin/kvenlin.github.io",
    repository_name: "kvenlin.github.io",
    owner_name: "kvenLin",
    owner_url: "https://github.com/kvenLin",
    issues_url: "https://github.com/kvenLin/kvenlin.github.io/issues",
    wiki_url: "https://github.com/kvenLin/kvenlin.github.io/wiki",
    pages_url: "https://kvenlin.github.io",
    contributors: [
      { name: "kvenLin", url: "https://github.com/kvenLin" }
    ]
  },
  build: {
    timestamp: __BUILD_TIME__,
    version: __APP_VERSION__,
    node_version: "20.x"
  },
  author: {
    name: "Kven Lin",
    email: "clf1256233771@gmail.com",
    bio: "Senior Engineer / Creative Developer",
    avatar: "https://avatars.githubusercontent.com/u/30554496?v=4"
  },
  projects: [
    {
      name: 'CineScript Board',
      description: '影视剧情脚本创作编辑器, AI辅助创作和角色一致性分镜构建',
      url: 'https://kvenlin.github.io/CineScript-Board/'
    },
    {
      name: 'VlogLens',
      description: '你的私人 AI 视频日记助手, 将随手拍的视频片段，一键转化为图文并茂的视觉日记和小红书风格种草文案',
      url: 'https://kvenlin.github.io/VlogLens/'
    }
  ]
};
