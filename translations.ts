
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Explorer
    searchPlaceholder: "Search files...",
    quickAccess: "QUICK ACCESS",
    dashboard: "Dashboard",
    filterTags: "FILTER BY TAGS",
    clear: "Clear",
    projectSource: "PROJECT SOURCE",
    
    // Editor / Dashboard
    welcome: "Hello, Developer.",
    intro: "Welcome to the <Neural_Interface /> of my digital brain. Browse code, read thoughts, and execute commands.",
    lastCommit: "Last Commit",
    totalPosts: "Total Posts",
    systemStatus: "System Status",
    recentEntries: "Recent Entries",
    hostedProjects: "Hosted Projects",
    visitProject: "Visit",
    resumeCta: "View Résumé",
    knowledgeGraph: "Knowledge Graph",
    activity: "Activity",
    high: "High",
    operational: "Operational",
    
    // Terminal
    termWelcome: "Welcome to DevBlog CLI [v2.0.4]",
    termConnect: "Connected to local session...",
    termHelp: "Type 'help' for a list of commands.",
    termCommandNotFound: "Command not found. Type 'help' for assistance.",
    termUsage: "Usage:",
    termError: "Error:",
    termDirectory: "is a directory",
    termNotFound: "not found",
    termOpening: "Opening",
    
    // Commands
    cmdHelp: "  help            List available commands",
    cmdLs: "  ls              List files in current directory",
    cmdOpen: "  open <file>     Open a file in the editor",
    cmdCat: "  cat <file>      Print file content",
    cmdLang: "  lang <en|zh>    Switch language (e.g., 'lang zh')",
    cmdClear: "  clear           Clear terminal output",
    cmdExit: "  exit            Close terminal",
    
    // Misc
    searchPrompt: "Search files or type a command...",
    proTip: "PRO TIP: Search by tags with #",
    openPalette: "+ K to open",
    sysStatusOnline: "ONLINE",
    sysStatusLabel: "SYS.STATUS"
  },
  zh: {
    // Explorer
    searchPlaceholder: "搜索文件...",
    quickAccess: "快速访问",
    dashboard: "控制台",
    filterTags: "标签过滤",
    clear: "清除",
    projectSource: "项目源码",
    
    // Editor / Dashboard
    welcome: "你好，开发者。",
    intro: "欢迎来到我的 <Neural_Interface /> 数字大脑。浏览代码，阅读思考，执行指令。",
    lastCommit: "最后提交",
    totalPosts: "文章总数",
    systemStatus: "系统状态",
    recentEntries: "最近更新",
    hostedProjects: "GitHub Pages 项目",
    visitProject: "访问",
    resumeCta: "查看简历",
    knowledgeGraph: "知识图谱",
    activity: "活跃度",
    high: "高",
    operational: "运行中",
    
    // Terminal
    termWelcome: "欢迎使用 DevBlog CLI [v2.0.4]",
    termConnect: "已连接到本地会话...",
    termHelp: "输入 'help' 查看命令列表。",
    termCommandNotFound: "未找到命令。输入 'help' 获取帮助。",
    termUsage: "用法:",
    termError: "错误:",
    termDirectory: "是一个目录",
    termNotFound: "未找到文件",
    termOpening: "正在打开",
    
    // Commands
    cmdHelp: "  help            列出可用命令",
    cmdLs: "  ls              列出当前目录文件",
    cmdOpen: "  open <file>     在编辑器中打开文件",
    cmdCat: "  cat <file>      打印文件内容",
    cmdLang: "  lang <en|zh>    切换语言 (如: 'lang en')",
    cmdClear: "  clear           清除终端输出",
    cmdExit: "  exit            关闭终端",
    
    // Misc
    searchPrompt: "搜索文件或输入指令...",
    proTip: "提示: 使用 # 搜索标签",
    openPalette: "+ K 打开",
    sysStatusOnline: "在线",
    sysStatusLabel: "系统状态"
  }
};
