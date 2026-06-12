---
title: Steamcommunity_302 Steam加速工具
tags: 实用工具
categories: 资源分享
comments: true
toc: true
toc_number: true
copyright: true
mathjax: false
katex: false
sticky: 0
date: 2025-12-05 15:10:00
updated: 2025-12-05 15:10:00
keywords:
description:
top_img:
cover: https://img.099115.xyz/img/20251205234857.png
excerpt: SteamCommunity302 是一款通过修改Hosts实现对Steam商店，社区访问加速工具。除此之外，该工具还支持GitHub，Twitch等多种网站。
---

### 下载地址

[直接下载](https://www.dogfight360.com/blog/wp-content/uploads/2025/10/steamcommunity_302_AMD64_V13.0.07_fix.zip)
[网盘下载](https://wwid.lanzouw.com/iAFkT37g1wni)
[更新日志](https://www.dogfight360.com/blog/18682/)

### 说明

设置说明

启动服务 – 启动后台服务
退出UI – (退出前端界面[服务启动退出UI,后端仍会在后台运行])
设置 – 进入设置页

停止服务 – 停止后台服务

1.本地反代功能设置开关2.证书设置 – 重置根证书(启动服务后将生成并导入新的根证书到系统) 3.模式开关 – Hosts 及 系统代理
自动修改系统hosts – 关闭时 启动服务后 将不会自动修改系统hosts文件
自动修改系统代理 – 关闭时 启动服务后 将不自动修改系统代理/PAC规则
注意:
普通用户二者至少开其一,否则将仅监听端口而不会自动生效
全关闭请手动写入hosts/设置系统代理

本地监听IP – 服务监听IP,默认为127.0.0.1,与其他服务冲突时可尝试127.0.0.2

系统代理:
禁用+不监听 – 禁用系统代理模式的监听功能,该功能将完全失效(包括手动指定IP端口)
PAC模式 – 修改系统”自动配置代理服务器(PAC)”,将仅对勾选的规则域名生效,其他域名不处理(规则详见pac.txt)
全局代理 – 修改系统”代理设置”,将直接接管所有经过系统代理的流量(对勾选规则+CDN优选生效,其他直连)
注意:(自动设置PAC/全局代理仅支持Windows,MacOS/Linux需手动设置代理) 4.全局设置
开机运行 – 前台:开机时前台运行(仅Windows),弹出UI窗口
开机运行 – 后台服务(无界面):仅启动后端服务,不会允许前台UI窗口
禁用 – 禁用开机运行

自动启动服务(前台) – 前台UI运行后程序将自动点击启动服务,搭配前台开机运行=带界面运行+自动启动服务
启动服务后自动更新配置 – 服务启动后将自动检测本地反代是否更新,若更新将在下次启动服务时生效(推荐开启)
5.Steam登录-本地反代 – 将Steam登录请求重定向至指定服务器以加速登录速度[非跨区]
(该功能目前Windows不可用,仅支持MacOS/Linux) 6.高级设置
CDN优选 – 对指定CDN进行自动测速+指定IP,以加快访问速度,针对Steam访问建议开启Akamai,其他按需开启/可搭配系统代理实现高级用法
速率限制 – 限制测速时的最高速率,防止测速时满带宽(每个CDN持续5秒)影响正常网络访问
上游域名(Steam相关) – 更改Steam相关访问时运营商防火墙识别的域名,用于规避个别运营商干扰

高级用法: 系统代理 搭配 CDN优选,实现自定义域名的CDN优选/全局访问CDN优选
PAC+CDN优选: 1.开启 自动修改系统代理2.系统代理 选择 PAC模式3.勾选CDN优选4.将需要被CDN优选的域名/顶级域名写入 pac_user.txt (每行1个) 5.保存后重启服务 [MacOS/Linux需手动设置代理,默认PAC为http://127.0.0.1:80/pac.txt?S302]

效果: 此时除了打勾规则外,写入的自定义域名也将经过程序处理
pac_user.txt内的域名若远程IP符合对应CDN的IP范围的访问将自动被重定向到优选IP
全局代理+CDN优选: 1.开启 自动修改系统代理2.系统代理 选择 全局代理3.勾选CDN优选4.保存后重启服务 [MacOS/Linux需手动设置代理,默认代理IP端口为http://127.0.0.1:80]
效果: 此时除了打勾规则外,所有经过系统代理且远程IP符合对应CDN的IP范围将自动被重定向到优选IP

[原文地址](https://www.dogfight360.com/blog/knowledge-base/steamcommunity_302_13_manual/)
