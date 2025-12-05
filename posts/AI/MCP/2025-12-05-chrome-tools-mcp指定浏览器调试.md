---
title: chrome-tools-mcp指定浏览器调试
date: 2025-12-05
tags: [mcp, chrome, google]
categories: 
  - AI/MCP
---


# chrome-tools-mcp指定浏览器调试

## mcp使用时遇到的问题
直接使用mcp的默认配置会导致每次打开的都是一个无状态的chrome浏览器, 这样会导致很多调试很不方便, 需要重复登录等操作.

所以需要将mcp指定到我们正常使用的chrome来进行开发调试.

## 配置mcp
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ]
    }
  }
}
```

在原有mcp配置的基础上使用 `--browser-url` 来指定打开的浏览器. 

## macOS下配置浏览器
### chrome启动指定调试端口
如果只指定端口的方式启动chrome会出现报错:

使用命令直接代开chrome进行调试提示必须设置user-data的目录, Chrome出于安全考虑，要求启用远程调试时必须使用非默认的用户数据目录

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764780942501-574665df-90d8-40cf-8cfd-a3c834d47321.png)

所以需要手动复制原有的chrome目录然后再指定目录打开.

```shell
cp -R ~/Library/Application\ Support/Google/Chrome/ /tmp/chrome-remote-profile
```

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764852109620-3b6ca4fd-1740-45cd-b662-c3a92f0dc693.png)

然后启动命令:

```shell
open -na "Google Chrome" --args \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-remote-profile
```

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764852136128-8f576a3b-dbe6-49ed-baa9-559655cc75fa.png)

这时候打开的chrome就是带有用户数据环境的chrome了.

### 设置快捷命令
为了快捷打开还可以在自己的shell环境设置快捷命令来打开chrome.

```shell
vim ~/.zshrc
```

最下方添加一行配置, 然后保存退出 `wq`

```shell
alias chrome-remote='open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-remote-profile'
```

## windows下配置浏览器
### 同步用户数据
找到用户的chrome数据文件夹, 默认数据是在账号的 `AppData\Local\Google\Chrome\User Data`路径下

```shell
# ${user} 为你当前的登录账号
C:\Users\${user}\AppData\Local\Google\Chrome\User Data
```

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764897175374-9d47cb2e-4820-45fb-8293-601090f7b6c3.png)

将整个`user data`复制一份数据到其他自定义的路径

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764897450618-f059a120-e52b-4d89-a526-760953cee1ac.png)

### 修改chrome快捷启动命令
右键chrome点击属性-快捷方式, 配置桌面图标快捷启动的命令

```shell
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="D:\software\chrome-data\User Data"
```

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764897518425-7d491fd0-f0c2-4c4f-a813-462a5394778b.png)

### 检查是否配置成功
使用快捷命令或双击快捷启动, 然后访问 `http://localhost:9222/json/version` 检查是否能正常访问到数据

返回如图所示的数据结构就表示配置正常了.

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764897948611-dfe5c140-303a-4348-8ae9-5b720b98bdb7.png)

## 测试mcp是否正常使用
随便找一个支持mcp的工具就行, 配置mcp配置后, AI正常调用即可

![](https://cdn.nlark.com/yuque/0/2025/png/28087079/1764904662170-fe2337c4-1a93-4ba4-9958-5f81beef0e76.png)

