---
title: Hello World！--建站日记
tags: [技术，编程]
categories: [开发编程, Web]
sticky: 1
date: 2025-12-07 12:02:22
updated: 2025-12-07 12:02:22
expires: 2026-6-07 12:09:22
keywords:
excerpt: 从零构建个人知识库：我的 Hexo + Cloudflare 全栈工程实录
top_img:
thumbnail:
cover: https://img.099115.xyz/img/20251207233502.png
---

# 一、 起源：为什么不直接用现成的平台？

我始终认为：**拥有数据的绝对控制权比便利性更重要。**

知乎、CSDN 等平台固然方便，但它们无法提供我想要的“沙盒体验”。我需要一个可以随意折腾代码、修改 CSS、配置网络协议，甚至自己写脚本自动化部署的地方。

这个博客，就是我的**技术试验场**。它不仅仅是用来写字的，更是用来**练手**的。

# 二、 技术选型：追求“免费”与“控制”的平衡

基于**工程权衡 (Trade-off)** 的思维，我选择了以下技术栈：

- **核心框架**：**Hexo** (Node.js 驱动，速度快，插件多)
- **托管平台**：**GitHub Pages** (免费，版本控制，但国内访问慢)
- **网络加速**：**Cloudflare** (CDN + DNS 解析 + SSL 证书)
- **开发工具**：**VS Code** + **Git Bash**
- **自动化**：**VS Code Tasks** (自制 CI/CD 流水线)

这套组合实现了**极低成本**搭建一个高可用、全球加速的静态网站。

# 三、 踩坑与填坑：工程能力的磨炼

搭建过程远比我想象的曲折，每一个报错背后都是一个知识点。

## 起点：搭建完成后的“虚假繁荣”

故事的开始很顺利。基于 **Hexo** 框架，配合 **GitHub Pages** 的免费托管，我很快就在本地把博客跑了起来。

看着终端里绿色的 `Hexo is running at http://localhost:4000`，我以为这就是结束。于是，我开始像装修新房一样，给博客安装各种插件：

- 安装了炫酷的主题（Redefine）；
- 配置了 RSS 订阅；
- 加上了访问统计；
- 引入了各种 Font Awesome 图标。

![20251207233639](https://img.099115.xyz/img/20251207233639.png)

然而，当我不经过本地预览，直接通过 GitHub Pages 的默认域名访问时，现实给了我一盆冷水。

**现象是残酷的：**

1.  **加载龟速**：GitHub 的服务器在海外，国内访问延迟极高。
2.  **样式崩坏**：很多插件依赖的 CDN（主要是 jsDelivr）在国内连通性极差，导致图标加载不出来，页面经常“缺胳膊少腿”。

作为一个追求完美的工科生，我无法忍受自己的“产品”是这种半成品状态。优化，势在必行。

## 破局：拥有自己的域名

要解决网络问题，第一步是把“控制权”拿回来。GitHub 提供的 `username.github.io` 域名是寄人篱下的，我无法对它做深度的 DNS 优化。

于是，我去购买了属于我的域名：`099115.xyz`。
![20251207233747](https://img.099115.xyz/img/20251207233747.png)

这不仅仅是一个网址，它意味着：

- **品牌标识**：这是我在互联网上的独立门牌号。
- **架构基础**：有了它，我才能接入 Cloudflare 这样的顶级 CDN 服务商。

## 进阶：DNS 配置与 Cloudflare 的博弈

买完域名，我并没有直接解析到 GitHub，而是选择了 **Cloudflare** 来接管 DNS。这不仅是为了加速，更是为了安全（HTTPS）。

### 1. 域名解析的“坑”

我将域名的 Nameservers 修改为 Cloudflare 提供的服务器。在设置 DNS 记录时，我没有选择直连（DNS Only），而是开启了 **Proxy（小黄云）** 模式。

这意味着：`用户 -> Cloudflare 边缘节点 -> GitHub Pages`。

![20251207234116](https://img.099115.xyz/img/20251207234116.png)
![20251207234129](https://img.099115.xyz/img/20251207234129.png)
理论上，Cloudflare 的全球 CDN 应该能加速访问，但在实际配置中，我遇到了两个大问题。

### 2. DNSSEC 的“僵尸死锁”

这是我遇到的最大 BOSS。在转移 DNS 的过程中，因为在 Namecheap 注册局残留了旧的 **DS记录 (Delegation Signer)** ，导致 DNSSEC 校验失败。

**表现：** 域名解析配置完全正确，但全球所有 DNS 服务器都拒绝解析，网站直接打不开。

**解决：** 使用 DNSViz 工具排查签名链，确认是“信任链断裂”。最终联系客服在注册局层面清除了残留记录，才解开了这个死锁。

![f151da3503909515182e6d99ad4250e0](https://img.099115.xyz/img/f151da3503909515182e6d99ad4250e0.jpg)

### 3. 速度优化的取舍

接入 Cloudflare 后，我发现部分 JS 脚本依然加载缓慢。

- **Rocket Loader** ：Cloudflare 自带的这个 JS 异步加载功能，虽然能跑分，但会破坏 Hexo 主题的渲染逻辑，导致页面空白。我果断关闭了它。
- **HTTP/3(QUIC)** ：为了对抗丢包，我强制开启了 HTTP/3 协议，显著提升了在弱网环境下的连接稳定性。

## 终极挑战：自建图片 CDN (Serverless 实践)

为了解决第三方图床（如 jsDelivr）在国内不稳定的问题，我利用 **Cloudflare Workers** 编写了一个反向代理服务，将 `img.099115.xyz` 的流量无缝转发到 GitHub 仓库，实现了图片加载速度的质的飞跃。

> 💡 关于图床改造的具体技术细节，我在另一篇文章中有详细记录：《[从 DNS 到反向代理：基于 Cloudflare Workers 自建高性能图片 CDN](https://099115.xyz/img/)》

# 四、工作流的优化：VS Code Automation

我不喜欢繁琐的命令行。每次发文章都要敲 `hexo n`、`hexo g`、`hexo d`，这太“低效”了。
于是，我研究了 **VS Code Tasks(`tasks.json`)** ，编写了一套自动化脚本：

- **一键新建**：输入文件名，自动生成带特定 Front-matter 的文章并打开编辑器。
- **一键部署**：自动清理缓存、重新生成、推送到 GitHub，并附带时间戳 Commit 信息。

```JSON
{
    "version": "2.0.0",
    "tasks": [
        // 任务 1: 部署
        {
            "label": "Deploy Blog (一键部署)",
            "type": "shell",
            "command": "hexo clean && hexo g && hexo d",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "options": {
                "shell": {
                    "executable": "cmd.exe",
                    "args": [
                        "/C"
                    ]
                }
            },
            "presentation": {
                "reveal": "always",
                "panel": "new"
            },
            "problemMatcher": []
        },
        // 任务 2: 新建文章
        {
            "label": "New Post (新建文章)",
            "type": "shell",
            "command": "hexo new \"${input:postTitle}\" && start .\\source\\_posts",
            "options": {
                "shell": {
                    "executable": "cmd.exe",
                    "args": [
                "/C"
            ]
        }
    },
            "group": "none",
            "presentation": {
                "reveal": "always",
                "panel": "new"
            },
            "problemMatcher": []
        }
    ],
    "inputs": [
        {
            "id": "postTitle",
            "type": "promptString",
            "description": "请输入新文章的标题"
        }
    ]
}
```

现在，写博客对我来说，只是点击一下“运行任务”那么简单。

# 五、 结语：不仅是博客，更是成长的见证

回顾这几天的搭建过程，我解决的问题涵盖了：

- **网络协议** (DNS, HTTPS, CDN)
- **前端工程** (Hexo, Node.js, CSS)
- **运维部署** (Git, CI/CD, Serverless)

**计算机科学不仅是关于代码的，更是关于系统的。** 这个博客就是我构建的第一个“小系统”。

从最初简单的 hexo deploy，到后来深入研究 DNS 协议、CDN 原理、HTTPS 握手以及 Serverless 脚本。

这个博客的搭建过程，其实就是我从一个“代码使用者”向“系统构建者”转变的过程。虽然折腾，但当看到网站在全球任何角落都能被瞬间打开时，那种工程师的成就感，是任何现成的平台都无法给予的。

**Hello World, this is just the beginning.**
