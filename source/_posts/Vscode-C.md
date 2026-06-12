---
title: Windows下的C语言编译环境配置
tags: [技术, 编程]
categories: [开发编程, C]
comments: false
toc: true
toc_number: true
copyright: true
mathjax: false
katex: false
sticky: 0
date: 2025-12-05 13:00:00
updated: 2025-12-05 13:00:00
keywords:
excerpt: 在VScode中配置编译器，并使用MSY32配置MinGw-64以运行C/C++程序
cover: https://img.099115.xyz/img/20251206000841.png
---

# 一.配置VS Code

Visual Studio Code是一款免费且基于开源的代码编辑器，功能强大，支持Git、调试和扩展。
[Visual Studio Code文档](https://vscode.js.cn/docs)
[下载 Visual Studio Code](https://code.visualstudio.com/)

注意：安装时务必勾选 **将Code注册为受支持的文件类型编辑器** 和 **添加到PATH** ，推荐全选

安装完成后打开，此时页面为英文，接下来安装中文拓展

左侧边栏选择拓展选项，在搜索框内输入：Chinese 或 简体中文，选中Chinese (Simplified) (简体中文) ，并点击Install选项，并等待
![20251210181447](https://img.099115.xyz/img/20251210181447.png)
安装完成后右下角弹窗确认

至此，你已完成Visual Studio Code的安装

安装必要拓展 ：`C/C++` `C/C++ Extension Pack` `Code Runner`

> 如提示是否信任请点击信任相关选项，请检查，您应安装有以下拓展：

![20251210181330](https://img.099115.xyz/img/20251210181330.png)

# 二.配置编译器

## 方法一（推荐）：

使用MingGW-w64部署脚本：

{% btn center large::立即下载::https://cdn.099115.xyz/MingGW-w64/mingGW-w64.zip::fa-solid fa-download %}

下载后解压缩，并右键 `install.bat` 以管理员身份运行，等待运行完成即可。

![20260208115801](https://img.099115.xyz/img/20260208115801.png)

## 方法二：

**安装 MinGW-w64 工具链**
通过 [MSYS2](https://www.msys2.org/) 获取最新版本的 MinGW-w64，它提供了 GCC、MinGW-w64 以及其他有用的 C++ 工具和库的最新原生版本。这将为你提供必要的工具来编译代码、调试代码并将其配置为与 [IntelliSense](https://code.visualstudio.com/docs/editing/intellisense) 配合使用。

1. 您可以从 MSYS2 页面下载最新的安装程序，或使用此[安装程序的直接链接](https://github.com/msys2/msys2-installer/releases/download/2024-12-08/msys2-x86_64-20241208.exe)。
2. 运行安装程序并按照安装向导的步骤进行作。请注意，MSYS2 需要 64 位 Windows 8.1 或更高版本。
3. 在向导中，选择所需的安装文件夹。记录此目录以备后用。在大多数情况下，推荐的目录是可以接受的。当您开始设置开始菜单快捷方式步骤时，这同样适用。完成后，确保选中“立即运行 MSYS2”框，然后选择“完成”。这将为您打开一个 MSYS2 终端窗口。
4. 在此终端中，通过运行以下命令安装 MinGW-w64 工具链：

```shell
pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain
```

5. 按 Enter 接受工具链组中的默认包数

![20251210181532](https://img.099115.xyz/img/20251210181532.png)

6. 当提示是否继续安装时输入 Y

7. 使用以下步骤将 MinGW-w64 bin 文件夹的路径 添加到 Windows PATH 环境变量中：

- 在 Windows 搜索栏中，键入“设置”以打开 Windows 设置。
- 搜索 编辑您帐户的环境变量。
- 在用户变量中，选择变量Path，然后选择编辑。
- 选择新建并将您在安装过程中记录的 MinGW-w64 目标文件夹添加到列表中。如果您使用了上述默认设置，则这将是路径C:\msys64\ucrt64\bin
- 选择“确定”，然后在“环境变量”窗口中再次选择“确定”以更新环境变量。 您必须重新打开任何控制台窗口才能使更新的环境变量可用。

**检查您的 MinGW 安装**
要检查您的 MinGW-w64 工具是否已正确安装且可用，请打开新的命令提示符并键入：

```bash
gcc --version
g++ --version
gdb --version
```

您应该会看到输出，说明您安装了哪些版本的 GCC、g++ 和 GDB

# 三.创建 Hello World 应用

回到桌面，新建一个文本文件，并将其重命名为 `main.c`

> 如未显示拓展名，请在资源管理器查看选项中开启

使用VS Code打开`main.c`，如提示是否信任该文件，请选择信任或打开，并输入以下内容

```C
#include <stdio.h>
int main(void)
    {
        printf("Hello,World!\n");
        return 0;
    }
```

现在按 Ctrl+S 保存文件,您还可以启用**自动保存**以自动保存文件更改，方法是选择文件>自动保存。

现在点击右上角运行按钮，并选择GCC编译器

> 您还可以使用VS Code文件夹功能，在VS Code侧边栏资源管理器选择卡中，可添加信任的文件夹，以进行更方便的文件管理操作，且在第一次运行后自动将选择的编译器设为默认，无需每次选择

在下方的终端中，已正确显示Hello,World!

祝贺！你刚刚在 VS Code 中运行了你的第一个C语言程序！

[原文地址](https://code.visualstudio.com/docs/cpp/config-mingw)
