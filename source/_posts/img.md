---
title: 从 DNS 到反向代理：基于 Cloudflare Workers 自建高性能图片 CDN
tags: [技术, 编程]
categories: [开发编程, Web]
sticky: 0
date: 2025-12-07 22:52:26
updated: 2025-12-07 22:52:26
expires: 2026-6-01 22:52:26
keywords:
excerpt: 利用 Cloudflare Workers 的边缘计算能力，搭建一套属于自己的企业级图片 CDN。这不仅是为了修好图片，更是一次对 DNS、反向代理和Serverless 架构的实战演练。
top_img:
thumbnail:
cover: https://img.099115.xyz/img/20251207225636.png
---

# 前言：为什么我要自己造轮子？

作为一个技术博主，最令人头秃的不是写不出代码，而是精心写好的文章里，图片加载不出来。

长期以来，我的博客图床一直依赖 GitHub + jsDelivr 的免费组合。这是一个经典的“白嫖”方案，但最近我发现 jsDelivr 在国内的连通性越来越差，经常出现图片裂开、加载龟速的情况。

# 架构设计：原理是什么？

在动手之前，先理清一下数据流向。我并没有迁移 GitHub 上的图片，而是做了一个“中转站”。

**改造前（直连模式）**： 用户浏览器 -> jsDelivr CDN (不稳定) -> GitHub 仓库

**改造后（反向代理模式）**： 用户浏览器 -> img.我的域名.xyz (我的私有入口) -> Cloudflare Worker (智能搬运工) -> GitHub 仓库

这样做有两个核心优势：

**1.域名私有化**：使用我自己的子域名，未来无论后端换成 AWS S3 还是阿里云 OSS，链接都不用变。

**2.线路优化**：利用 Cloudflare 优选线路和缓存机制，大幅提升加载速度。

# 实战步骤：从零搭建

## 1. DNS 配置：无中生有的“子域名”

首先，我需要为图片服务开辟一个专属入口。在 Cloudflare 的 DNS 设置中，我添加了一条记录：

Type: CNAME

Name: img (这就创建了 img.099115.xyz)

Target: ghost0190.github.io (作为流量承载目标)

Proxy Status: 开启 (Proxied)

![20251207230031](https://img.099115.xyz/img/20251207230031.png)

这一步的本质，是在互联网地图上插了个路牌，告诉 DNS：“想找图片的，先来找 Cloudflare。”

## 2. 部署 Cloudflare Worker

接下来是核心部分。我创建了一个 Worker 服务，使用以下代码。这段代码充当了“翻译官”的角色：它截取用户的请求路径，自动去 GitHub 原仓库抓取对应的图片，并返回给用户。

```JavaScript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 配置我的仓库信息
  const GITHUB_OWNER = 'ghost0190';
  const GITHUB_REPO = 'blog-imgs';
  const GITHUB_BRANCH = 'main';

  // 拼接 GitHub Raw 地址
  const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

  // 解析请求路径
  const url = new URL(request.url);
  const filePath = url.pathname;

  // 1. 去 GitHub 取货
  const targetUrl = GITHUB_RAW_URL + filePath;
  const response = await fetch(targetUrl, request);

  // 2. 加上长效缓存头 (Cache-Control)
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');

  // 3. 返回数据
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
```

## 3. 路由绑定

代码写好了，还得告诉 Cloudflare 什么时候运行它。我在 Worker的Setting -> Domains & Routes中添加了规则：`img.099115.xyz/*`

![20251207230550](https://img.099115.xyz/img/20251207230550.png)

这意味着：凡是访问这个子域名下任何路径的请求，统统交给这个 Worker 处理。

## 4. 客户端配置 (PicGo)

最后，打通写作流程。我在 VS Code 的 PicGo 插件配置中，将 customUrl 修改为我的新域名

```JSON
"picgo.picBed.github": {
    "customUrl": "https://img.099115.xyz"
}
```

现在，我粘贴图片的瞬间，生成的链接就是我自己的域名了。

# 结语

当看到图片瞬间加载出来，且 URL 前缀变成了我自己的域名时，那种掌控感是第三方服务无法给予的。

工程能力的提升，往往就藏在这些“为了解决一个小问题而不惜重构整个链路”的折腾之中。
