---
name: write-attractive-readme
description: 按花叔（GitHub: alchaincyf）高 star 项目的实测套路写/重写/审查开源仓库 README，产出能拿 star 又经得起复算的中文 README。凡用户说「写个有吸引力的 README」「照花叔风格写」「这个 README 不够抓人」「开源这个项目顺便写 README」「README 太干/帮我改首页」「上线前审一遍 README」，或已写完 README 要做发布前检查时使用。适用对象：Agent Skill、CLI/库、HTML 单文件工具、小型开源项目，尤其是 0 star、无 GIF、无 demo 站、无账号露出需求的新仓库。不用于 API 参考文档、内部 wiki、CHANGELOG，也不用于已有真实动图画廊与 live demo 的成熟项目（那类直接按 references/formula.md 的完整档补节即可）。
---

# 写有吸引力的 README（花叔风格）

## Overview

把 alchaincyf 高 star README 的骨架、语气和证据装置变成可执行流程：先定档 → 采料 → 照骨架写 → 跑校验器 → 交付前人肉测 hero。

风格可以照搬，**证据不能照搬**。他手上有的资产（GIF 画廊、YouTube 亲录、live demo 站、Star History 曲线、A/B 方差数字、社区 fork 表、平台账号）新仓库一个都没有。本 skill 的核心工作就是：**把每一种资产换成 0-star 仓库也能当场复算的替代物**，换不出来的整节删掉。

判据一句话：读者读完能说出「它是什么 / 给谁用 / 凭什么信」。第三问答不上来就是没写完。

## 何时不用

- 只要技术文档、API 参考、内部说明——这套骨架是营销与信任结构，不是文档结构。
- 项目还没有可运行产物：先出产物，再来写 README。没有 A 级证据时任何钩子都是撒谎。
- 用户明确要「简短一点」：用极简档（hero + 安装 + 用法 + License），但**局限/负面内容不许省**——这是全套规则里唯一没有例外的一条。

## 五步流程

**第 1 步 · 定档（读 `references/formula.md` §三）**

| 档 | 用于 | 样本 |
|---|---|---|
| A 能力型 skill | Agent Skill / CLI / 单文件工具 | nuwa-skill、huashu-design、huashu-excel、huashu-chrome |
| B 生成物型 | 从素材里提炼出产物的仓库 | zhangxuefeng-skill、steve-jobs-skill |
| C 产品/App 型 | 真要给非中文用户看的桌面/Web 产品 | fanbox |

离群形态（普通工具站、目录索引、书/文档、89 行极简）**不照抄**，判定依据见 `references/corpus.md`。

**第 2 步 · 采料（读 `references/evidence.md`）**

在动笔之前把下面这张表填满，填不满的项目就是不许写的项：

```
可复算事实（A 级）：行数 / 机制数 / 脚本实测输出 / 零依赖 grep 命中 / 可双击的示例文件
真实负面结论（≥3 条）：做不到什么、什么时候会掉分、哪条路被推翻
一句人话价值主张：动词 + 一个交付物，不含形容词
一个具体事故数字：来自真实使用或真实测试，不是估的
每条断言的复算命令：读者克隆后能原样跑
```

估出来的数字一律不写。要写「减少 X%」「N 个」就先跑脚本量，并把量法一起写进 README。

**第 3 步 · 照骨架写（复制 `assets/skeleton.md`）**

hero 13 行顺序不许打乱（居中 div → 名字 → 钩子 → badge → 加粗价值 → 兼容声明 → 问题陈述 → 一行安装 → 导航锚点行 → `</div>` → `---`）；正文按 A/B/C 档排，**效果节排在安装节之前**（7/8 样本如此）。

标题写成断言句（以下三句为样本原句，出处 huashu-chrome / huashu-excel）：`每个操作都要交待「到底动没动」`、`一次说完，别来回八趟`、`脚本是眼睛，不是大脑`。泛化标题（功能、特性、简介、使用说明、FAQ）一律改名。

句子层面照 `references/voice.md` 的 11 条：短句成段、「不是 X，是 Y」定位、`——` 补刀、数字代替形容词、第二人称具体动作、先抛反问、自贬式诚实、承认来源、收尾对句回扣钩子。禁用词：强大、极致、完美、海量、一键、无缝、优雅、颠覆、赋能、打造。

**第 4 步 · 跑校验器（必须 0 FAIL）**

```bash
node scripts/check-readme.mjs README.md            # 静态 24 项
node scripts/check-readme.mjs README.md --http     # 再加 badge / 外链状态码探测
```

FAIL 全清才能交。WARN 逐条判断，允许留但要能说出为什么。

判别力实测：同一脚本跑 10 个 canonical 样本 → 8 个 0 FAIL（`huashu-md-html` 那 1 个 FAIL 是真缺边界声明，属正确报警）；跑 4 个离群样本 → 2-4 FAIL；跑故意埋雷的副本 → 死锚点、泛化标题、空泛形容词、本机真实路径、`TODO`/`{{占位}}`、`<div>` 不配对全部抓出。

**第 5 步 · 交付前人肉过一遍**

只滚到 hero 做 30 秒测试（见 `references/evidence.md` 末节）。然后核对：

1. 每个页内锚点都能落到真实标题（中文标题带全角标点时 GitHub 的 slug 规则会吃掉标点、不折叠连字符；校验器已内置经验证的 slugify）。
2. badge URL 全部返回 2xx/3xx（含 `://` 的 label 必须 URL-encode）。
3. `.gitignore` 没把示例文件吃掉：`git check-ignore -v examples/<文件>`。裸文件名会连带忽略同名子目录文件，README 唯一的视觉证据可能悄悄没上传。
4. 示例数据脱敏：真实项目名、账号、本机路径、客户名、注册表键全部中性化，且替换走「每对唯一命中 + 残留 token 计数为 0」的脚本，不手改。

## 红线

- **不写作者身份内容**：平台表、账号、二维码、「关于作者」节、`© 个人姓名` 署名行默认全部不写。需要出口时改写成「反馈与贡献」节。骨架里这一节是花叔的资产，不是必需件。
- **不借用视觉资产**：包括作者自己另一个项目的 GIF。没有真图就用 ASCII 线框图或仓库内可打开的示例文件。
- **0 star 不放 Star History**，没有社区不写社区翻译表。
- 未经用户要求不 commit / push；README 定稿先交用户审。

## 来源与授权

风格样本 = GitHub 用户 alchaincyf（花叔）名下公开仓库的 README，10 个样本仓的 LICENSE 均为 MIT（版权人 `Copyright (c) 2026 alchaincyf (花叔 · 花生)`）。本 skill 只在评论与说明目的下引用成句原文，引用处逐条标注来源仓库；许可核对与命中率复算命令见 `references/corpus.md`。

本项目与 alchaincyf 无关联，未获其背书或审校。

## Resources

- `references/formula.md` — hero 13 行逐行解剖 + 14 节目录（回答什么问题/长度/装置/样本原句）+ 三档变体 + 离群形态
- `references/voice.md` — 11 条句子层面规则，每条带真实原句与反例，含禁用词表
- `references/evidence.md` — A/B/C 三级证据 + 花叔装置→0-star 替代物映射表 + 7 条发布硬红线 + 发布后 gh api 核对命令
- `references/corpus.md` — 14 个样本清单与 star 数、26 项装置命中率、锚点算法验证记录、校验器判别力实测、重新校准流程
- `assets/skeleton.md` — 可直接复制的 README 骨架，占位符 + 填表注释
- `scripts/check-readme.mjs` — 24 项静态校验 + 可选 `--http` 链接状态码探测，退出码 0/1
