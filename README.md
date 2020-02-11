# OpenCore 简体中文参考手册

> **非官方** 维护的 OpenCore 参考手册的简体中文翻译

## 简介

这个仓库存放的是 https://oc.skk.moe 的源码。

由于 OpenCore 仍然在积极地开发和迭代，OpenCore 参考手册 仍然在高频率更新，我们需要更多黑苹果爱好者参与到翻译工作中。

- [OpenCore 官方参考手册](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf)
- [OpenCore 官方参考手册迭代说明](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Differences/Differences.pdf)

## 法律说明

**本仓库以及 `https://oc.skk.moe` 网站和 OpenCore 的开发团队 `acidanthera` 以及 OpenCore 官方参考手册的版权所有者 `vit9696` 没有任何关系**。OpenCore 官方参考手册使用 BSD-3 协议开源。`https://oc.skk.moe` 对 OpenCore 的 Logo（商标）的使用已经过 `acidanthera` 的授权。

## 构建

「OpenCore 简体中文参考手册」使用 [Hexo](https://hexo.io) 和 [hexo-theme-doku](https://doku.skk.moe) 进行构建。Hexo 的安装和使用依赖 Node.js 和 Git，请参考 [Hexo 的文档](https://hexo.io/zh-cn/docs/)。

如果你仅在本项目使用 Hexo，无需全局安装 Hexo：

```bash
git clone https://github.com/SukkaW/OpenCore-Document-zh_Hans.git && cd OpenCore-Document-zh_Hans
npm install # 安装构建依赖
npm run clean # 清理编译缓存和输出目录
npm run build # 编译页面并输出到 public 目录
npm run server # 运行一个 Server 并 watch 所有改动
```

## 发布

项目使用 GitHub Action 对提交到 `master` 的每一条 Commit 进行构建、并推送至 `gh-pages` 分支、自动部署到 https://oc.skk.moe 上。

## 贡献

请阅读 [贡献指南](https://oc.skk.moe/about/contributing.html)。
