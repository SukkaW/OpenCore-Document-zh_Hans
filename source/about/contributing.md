---
title: 贡献指南
description: 没有规矩，不成方圆
type: about
author_info:
---

## 目录结构

文档所有文件位于 `source` 下。

- `about` 目录：关于项目自身的文档，如你现在看到的「贡献指南」的 md 源文件就位于这个目录下
- `guide` 目录：如果未来项目开始收录 OpenCore 指南类的文章，就将相关的 md 文件放在这个目录下
- `img` 目录：存放文档中使用的图片
- `logo` 目录：存放 OpenCore 的 Logo 和网站的 favicon
- `CNAME` 文件：GitHub Pages 绑定自定义域名
- `index.md` 文件：网站首页的 md 源文件
- 其余 `.md` 文件：经过整理的 OpenCore 参考手册的 md 源文件（需要翻译的就是这些文件）

## Markdown 文件的 Front-Matter 的字段说明

```markdown
---
title: # 标题
description: # 副标题、当前页面的一句话简介（可选）
type: docs # 文件类型。不同类型的文件、构建后的页面左边侧边栏的内容不同
author_info: # 整理者、翻译者、校对者信息（可选）
last_updated: # 最后修改日期，使用 ISO 8681 格式（YYYY-MM-DD，可选）
---
```

当你完成了对一个文件的整理、翻译后，别忘了修改 `author_info` 和 `last_updated` 两个字段！

## Commit Message 规范

```
<type>(<scope>): <subject>
<BLANK LINE(Not necessary)>
<body>
```

**type**

- init: Initialization 初始化项目、模块、组件
- docs: Documentation 文档（包括 README 的更新）
- revert: Revert 代码回退，用于撤回某个改动
- feat: New feature 新功能
- fix: Fix bug 修补 bug
- style: Format 格式（不影响代码运行的变动）
- refactor: Refactor 重构（即不是新增功能，也不是修改 bug 的代码变动）
- test: Test 测试相关
- workflow: WorkFlow 工作流相关
- chore: 构建过程或辅助工具的变动
- merge: 合并 Pull Request
- ci: 持续集成和构建相关

允许多个 type 的使用，如修复文档中的 Typo 可以用 `docs/type` 作为 type。

**scope**

scope 用于说明 commit 影响的范围（一般取修改的文件的名称），紧接 type 置于 `()` 之内。

scope 非必须，当改动代码范围较大或者范围不明确时可忽略。

> 当使用 Merge Pull Request 合并不同分支时，scope 为 PR 在 GitHub 上的编号；当使用 revert 回退代码时，scope 为对应 commit 的 Title，也可以是简短的介绍。

**subject**

subject 是 commit 目的的简短描述，不超过 50 个字符。

- 以动词开头
- 使用第一人称现在时比如 change，尽可能避免使用 changed 或 changes
- 首字母小写，并且 尽可能 subject 全部小写
- 结尾不加句号 .
- 当 type 是 merge 时，subject 应为 from {base branch name} into {target branch name}

**body**

Body 部分是 可选的 对本次 commit 的详细描述，可以分成多行。下面是一个范例。

```
docs(commit): add about body of commit message
More detailed explanatory text, if necessary. Wrap it to about 72 characters or so.

Further paragraphs come after blank lines.

- Bullet points are okay, too
- Use a hanging indent
```

和 title.subject 不同，Body 的要求如下：

- Body 是可选、非必须的
- 使用第一人称现在时比如 change，尽可能避免使用 changed 或 changes
- 应该说明代码变动的动机，以及与以前行为的对比。
- 如果使用 Squash 合并分支时，Body 为以无序列表排列的对应多条 commit 记录。

## 其他参考资料

- [Hexo 文档](https://hexo.io)
- [hexo-theme-doku 文档](https://doku.skk.moe)
