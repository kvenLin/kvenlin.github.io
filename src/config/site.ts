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
  };
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
    timestamp: new Date().toISOString(),
    version: "2.1.0",
    node_version: "20.x"
  },
  author: {
    name: "Kven Lin",
    email: "dev@kven.lin",
    bio: "Senior Frontend Engineer / Creative Developer"
  }
};
