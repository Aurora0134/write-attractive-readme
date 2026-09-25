<sub>🌐 <b>中文</b> · <a href="#english">English</a></sub>

<div align="center">

# write-attractive-readme

> *"README 的说服力不在形容词里，在读者能自己跑的那条命令里。"*
> *"Attractiveness is reproducible."*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-Standard-green)](https://agentskills.io)
[![skills.sh](https://img.shields.io/badge/skills.sh-Compatible-blue)](https://skills.sh)
[![校验项](https://img.shields.io/badge/%E6%A0%A1%E9%AA%8C%E9%A1%B9-24%20%E9%A1%B9%E9%9D%99%E6%80%81-c2410c)](#规则不许只活在散文里)

<br>

**把花叔高 star README 的骨架、语气和证据装置，拆成照着能写的骨架 + 跑起来能判分的校验。**

<br>

**「你这 README 凭什么让人信？」** —— 开源过东西的人都被自己问过。
答不上来通常不是文笔差，是那篇文档里没有一个读者能自己核对的东西。

**而只抄风格会更糟。** 他的钩子你抄来了，他的 GIF 画廊、亲录教程、live demo 站、Star History 曲线、A/B 方差数字你一样都没有 —— 剩下的就是一堆形容词，而且是一眼能看出来的那种。

这个 skill 干的事就一件：把「说服力从哪来」拆成可核对的三层 —— 14 个公开 README 实测的 **26 项装置命中率**、**A/B/C 三级证据分级**、**24 项静态校验（外加逐条外链状态码探测，显式开启）**。同时立一条规矩：**你没有的资产，整节删掉，不要写。**

```
npx skills add <owner>/write-attractive-readme
```

跨 agent 通用 —— Claude Code、Codex、Cursor、Qoder、OpenClaw 都能装。

[看判分](#校验器在真语料上怎么判分) · [安装](#装上就能用) · [核心机制](#核心机制) · [来源与授权](#来源与授权) · [局限](#它教的是一档风格不是普适标准)

</div>

---

## 校验器在真语料上怎么判分

不是拿假想样例演示。同一份脚本，跑的是 GitHub 上真实存在、你现在就能抓下来复算的 14 个 README：

```
A 能力型 / B 生成物型（9 个）
  nuwa-skill          0 FAIL /  2 WARN / 22 PASS
  huashu-design       0 FAIL /  4 WARN / 20 PASS
  huashu-excel        0 FAIL /  3 WARN / 21 PASS
  huashu-chrome       0 FAIL /  3 WARN / 21 PASS
  zhangxuefeng-skill  0 FAIL /  3 WARN / 21 PASS
  steve-jobs-skill    0 FAIL /  5 WARN / 19 PASS
  x-mentor-skill      0 FAIL /  3 WARN / 21 PASS
  darwin-skill        0 FAIL /  9 WARN / 14 PASS
  huashu-md-html      1 FAIL /  3 WARN / 20 PASS   ← 真缺边界声明，不是规则误报
C 产品/App 型（1 个，双语档）
  fanbox              3 FAIL /  8 WARN / 12 PASS   ← 双语档不适用这套中文规则，见 formula.md §三
离群形态（4 个）
  huashu-report       4 FAIL /  8 WARN / 11 PASS
  huashu-skills       4 FAIL /  7 WARN / 12 PASS
  hermes-orange-book  2 FAIL /  9 WARN / 12 PASS
  img2046             4 FAIL / 13 WARN /  6 PASS
另一个 0 star 仓库（无 GIF、无 demo 站、无教程视频）用这套流程写出的 README：
  24 项静态全 PASS，5 条外链全 200，0 FAIL / 0 WARN
```

本 README 自己跑分：0 FAIL / 1 WARN。那条 WARN 是它谈到「Star History」「33k star」时触发的 —— 这里把它们当事实引用并给了核对命令，没有嵌任何星图，所以按「WARN 逐条判断」留下。

> 表里两个数会漂，因为它们随被检文档本身变化：PASS 数 = 24 项静态检查（探测到的问题会以 WARN/FAIL 顶掉对应 PASS），外链探测条数 = 该 README 里的链接个数。所以 `22 PASS` 与 `20 PASS` 的差别不是规则变了，是那份文档少踩了一个坑。

判据不是「越像花叔分越高」。跑完之后规则被数据改过两次：显式 `Limitations` 节只有 2/10 命中，但 10/10 都有 inline 负面结论 —— 于是诚实度改成按「有没有负面内容」判，不按「有没有那一节」判；`huashu-md-html` 是唯一被判 FAIL 的他自家 README，报警保留，没有为了让样本全绿而放松规则。放宽「效果节」关键词那次也做过回归：14 篇的 FAIL 数一处没变，说明放宽只去掉误报、没放水。

反向用例也过了：一份本来 0 FAIL 的 README，故意埋进死锚点、泛化标题、空泛形容词、本机真实路径、未替换的花括号占位符、少一个 `</div>` —— 六项全部被抓出。

复算：

```bash
for r in nuwa-skill huashu-design img2046; do
  gh api "repos/alchaincyf/$r/readme" -H "Accept: application/vnd.github.raw" > "$r.md"
  node scripts/check-readme.mjs "$r.md" | tail -1
done
```

---

## 装上就能用

**方式一：一行命令（推荐，跨 runtime）**

```
npx skills add <owner>/write-attractive-readme
```

**方式二：手动放置**

| runtime | 放到哪 |
|---|---|
| Claude Code | `~/.claude/skills/write-attractive-readme/` |
| Codex / Cursor | 各自 skills 目录下同名文件夹 |
| Qoder | `~/.qoder/skills/write-attractive-readme/` |
| 只当参考读 | 直接看 `SKILL.md` + `references/` 四个文件 |

**方式三：只借骨架**

`assets/skeleton.md` 是纯 Markdown，任何项目复制过去都能填，不装 skill 也能用。

> **装完先自检**：这个 skill 不是 SKILL.md 一个文件。`references/` 那四份才是主体 —— 26 项装置命中率表、13 处逐条标注 MIT 来源的引用、112 处指向样本仓库的引用；`assets/skeleton.md` 与 `scripts/check-readme.mjs` 是配套件。全仓应当有 7 个 skill 文件、约 780 行（`cat SKILL.md references/* assets/* scripts/* | wc -l`）。只有 SKILL.md 说明装坏了，重装一次。

然后在你的 agent 里直接说话：

```
「把这个仓库按花叔风格写一份 README，先给我本地预览」
「审一下我现在的 README，哪里在吹、哪里缺证据」
「这份 README 上线前跑一遍校验，把 FAIL 逐条讲清楚」
「0 star 仓库没有 GIF 没有 demo 站，帮我把说服力换成能复算的东西」
```

---

## 能做什么

| 能力 | 交付物 | 典型耗时 |
|---|---|---|
| 从零写一份 | `README.md`（A/B/C 三档骨架任选一档） | 15–25 分钟 |
| 重写已有 README | 逐节 diff + 校验前后分数对照 | 10–15 分钟 |
| 发布前审查 | 24 项静态报告 + 逐条外链状态码，退出码可进 CI | 1 分钟 |
| 证据换料 | 0-star 替代物清单：可复算数字、可双击示例、ASCII 线框图 | 5–10 分钟 |
| 语料重校准 | 新的 `gh api` 抓取 + 装置命中率表 | 20 分钟 |

---

## 核心机制

### 风格能抄，证据不能抄

`references/evidence.md` 把证据分三级：**A 级**读者能当场复算（行数、机制计数、脚本输出、零依赖 grep 命中）；**B 级**需要真实资产支撑（GIF、live demo、亲录视频、star 曲线、A/B 实验）；**C 级**无法核实（用户数、"业界领先"、借来的截图）。规则只有一条：B 级拿不出实物就整节删，不许降级成形容词。

| 他的装置 | 隐含前提 | 你没有时换成 |
|---|---|---|
| hero GIF | 有动画产物 | 仓库内可双击的 `examples/`，或 ASCII 线框图 |
| Star History | 有 star 增长 | 删。0 star 图等于自报没人用 |
| YouTube 教程 | 有账号、愿露身份 | 删。别用「文档更详细」占位 |
| A/B 方差数字 | 真跑过对照 | 文件级实测数字 + 把量法贴进 README |

### 标题必须是断言句，不是目录词

样本里最好的节名都是一句完整的话：`每个操作都要交待「到底动没动」`（huashu-chrome）、`脚本是眼睛，不是大脑`（huashu-excel）。泛化标题（功能、特性、简介、使用说明、FAQ）校验器直接报警。判据：读完标题不知道这节在主张什么，就是目录词。

### 数字要么能复算，要么删掉

写「快」不如写「3 到 30 分钟」，写「支持很多风格」不如写「60 种（网页 20 + PPT 20 + 信息图 20）」。凡是文档里的量化断言，配套给一条读者能原样跑的命令 —— 上面那张判分表就是这么来的。9 个 A/B 档样本合计只有 7 处空泛形容词 / 2,738 行，这个比例就是它的语言底线。

### 规则不许只活在散文里

能机械检查的规则一律进脚本，一共 24 项静态，外加显式开启的逐条外链状态码探测。其中最不显然的一项是页内锚点：GitHub 的 slug 会直接删掉中文全角标点、把空格转成连字符**且不折叠重复**，`信息图 / 数据可视化` → `信息图--数据可视化`，`（2.0）` → `20`。脚本里的 slugify 对着两个真实仓库渲染出的 52 个标题锚点逐条核对，52/52 命中，所以它对中文 README 不会误报。

### 唯一没有例外的那条：先说做不到

既没有局限节、也找不到一处负面结论的 README 直接判 FAIL。这条不许因「项目还小」而豁免 —— 读者判断边界的欲望永远大于听你夸自己。参照做法是 huashu-chrome：在效果表最后一行故意留一条 ❌ 做不到，并写明「能干什么和干不了什么同样重要」。

---

## 和花叔本人 README 的关系

我读的是他的公开仓库，抄的是方法论，不是内容。定位差异说清楚：

| | **本 skill** | 花叔的 README | 通用技术写作指南 | 在线 README 生成器 |
|---|---|---|---|---|
| 形态 | Agent Skill + 校验脚本 | 单篇文档 | 长文档 / 站点 | 表单 → 填好的 Markdown |
| 产出有没有判分 | ✅ 29 项，退出码可进 CI | ❌ | ❌ | ❌ |
| 证据分级与 0-star 替代 | ✅ 本仓库的核心 | 隐含在他的写法里 | ❌ | ❌ |
| 中文 README 专项 | ✅ 锚点、全角标点、排版都实测过 | ✅ | ⚠️ 以英文为主 | ⚠️ 模板腔 |
| 会替你吹 | ❌ 数字必须能复算 | — | ❌ | ✅ 容易产出形容词 |

两句公道话：他的 README 之所以好看，是因为他真的有 GIF、有 demo 站、有 33k star —— 这个 skill 变不出这些资产，它只能让你在没有这些东西时不撒汤漏水；而通用技术写作指南在「文档清楚」这件事上比他更严格，只是不解决 star 从哪来。

---

## 来源与授权

- **样本**：GitHub 用户 [alchaincyf](https://github.com/alchaincyf)（花叔）名下 14 个公开仓库的 README，抓取于 2026-09-25，完整清单与 star 数见 [`references/corpus.md`](references/corpus.md)。
- **许可**：这 10 个 canonical 仓库的 LICENSE 全部经 GitHub license 端点核对为 **MIT**，版权人 `Copyright (c) 2026 alchaincyf (花叔 · 花生)`。逐仓核对：

```bash
gh api repos/alchaincyf/nuwa-skill/license --jq '.license.spdx_id'   # → MIT
```

- **引用范围**：只引用成句原文（单处最长 58 字），合计 76 处 / 约 1,700 字，其中中文散文 758 字。`references/` 里 13 处用 `（仓库名 · MIT）` 逐条标注（复算：`grep -ro '（[a-z0-9-]* · MIT）' references/ | wc -l` → 13）；另有引用块把出处标在紧下方一两行的（如 voice.md §10 的三行收尾对句），其余命中的是 HTML 标签、badge URL、仓库名这类不构成受保护表达的部分。未复制任何一篇 README 全文，未使用其图片、GIF、字体等视觉资产。
- **版本时点**：huashu-design 自 2026-05-14 起才是 MIT（此前是限制商用的 Personal Use License），hermes-agent-orange-book 第 1 版是 CC BY-NC-SA 4.0。本 skill 只取当日 HEAD，不引用旧条款版本下的文本。
- **关系声明**：本项目与 alchaincyf 无关联，未获其背书或审校。他对自己材料的授权写得很清楚 —— 「随便用，随便改，随便造」，注明出处不强制但欢迎。这条就是照办。

---

## 安全与数据流

**纯本地文本处理，默认零网络。** 校验器只读你指定的那个 `.md` 文件，不发送到任何地方；唯一会联网的是显式加 `--http` 时的链接状态码探测，逐条 curl 你在 README 里自己写下的 URL，不加就不发一个包。无 telemetry，无账号，无外部依赖（`scripts/check-readme.mjs` 只用 Node 内置模块）。

---

## 它教的是一档风格不是普适标准

- **只有 GitHub 中文开源圈那一档成立。** 面向欧美开发者的产品仓库照 A 档写会显得用力过猛；`fanbox` 那种双语产品档是另一套。
- **英文样本只有 1 个。** 校验器对中英混排 README 的命中率统计，精度低于纯中文。
- **2026-09-25 的快照会漂。** 命中率、star 数、章节顺序都是当日实测，仓库改版后要重新校准，`references/corpus.md` 里给了完整复算流程。
- **结构能查，好不好查不出。** 24 项静态校验管得到「有没有钩子、锚点死没死、是不是在堆形容词」，管不到「这句话读起来烦不烦」—— 那一步仍要人读，README 交付前请把 hero 单独滚一遍。
- **WARN 不阻塞。** 24 项里判为 WARN 的那些仍归你决定，脚本不替你决定要不要写 English 节。

这是一个能挡住毛坯房的 skill，不是能替你写出爆款的 skill。对不愿意逐条核对规则的人，24 项校验比一份风格指南好用。

---

## 仓库结构

```
write-attractive-readme/
├── SKILL.md                    # 主档：定档 → 采料 → 照骨架写 → 跑校验 → 人肉过一遍
├── README.md                   # 本文件
├── LICENSE                     # MIT（含样本归属说明）
├── assets/
│   └── skeleton.md             # 可复制骨架，占位符 + 每节该填什么的注释
├── references/
│   ├── formula.md              # hero 13 行逐行解剖 + 14 节目录 + 三档变体 + 离群形态
│   ├── voice.md                # 11 条句子层面规则，每条带原句与反例，含禁用词表
│   ├── evidence.md             # A/B/C 三级证据 + 替代物映射 + 7 条发布硬红线
│   └── corpus.md               # 14 个样本清单、26 项命中率、许可核对、锚点算法验证、重新校准流程
└── scripts/
    └── check-readme.mjs        # 24 项静态校验 + 可选 --http 链接探测，退出码 0/1
```

---

## 这套方法论怎么长出来的

一开始按直觉写过一版：把他的句式抄下来当规则。抓完 14 个 README、给每篇打完 26 项命中表之后，三处直觉当场死掉 —— 显式 Limitations 节只有 2/10（但负面内容 10/10）、Star History 只有 2/10、能做什么表只有 4/10。**「花叔风格」的真实骨架不是几篇文档的印象，是一张命中率表。**

第二处修正更贵：校验器最早用 `/dev/null` 承接 curl 响应，在 Windows 上从 Node 子进程调用时全部返回 exit 2，看起来像「外链全挂了」。真相是本机 DNS 与 MSYS 路径转换两件事叠在一起。修完之后它才第一次给出可信的 200。规则能被机器执行之前，得先确认机器没在骗你。

---

## 反馈与贡献

- 报「规则误报」请带上被判 FAIL 的那份 README 原文（或它的 URL）和 `check-readme.mjs` 的输出 —— 判据是脚本输出，不是描述。
- 报「缺一条装置」请指向一个具体仓库：命中率表里新增一行要有可复算的来源，光有观点不收。
- 想把这套方法用在别的语言或别的平台（Read the Docs、GitLab、内部 wiki）：先抓 10 个样本重跑命中率表，再改 `formula.md`。骨架可以分叉，证据不能。

## License

MIT —— 随便用，随便改。样本原文按各自的 MIT 归属原作者，见「来源与授权」。

---

<div align="center">

**风格指南** 告诉你该写哪些节。<br>
**本仓库** 告诉你凭什么读者要信、以及没有那些资产时怎么补。<br><br>
*说服力不在形容词里，在读者能自己跑的那条命令里。*

<br>

MIT License

</div>

---

## English

> *"Attractiveness is reproducible."*

A Chinese-first Agent Skill for writing GitHub READMEs in the style of **alchaincyf**'s high-star projects, distilled from a measured corpus: 14 public READMEs fetched on 2026-09-25, scored against 26 structural devices (centered hero 10/10, badge row 10/10, nav-anchor row 8/10, explicit Limitations section only 2/10 — which is why the honesty rule checks for *negative content*, not for a section).

The core claim: **you can copy his structure and tone, you cannot copy his evidence.** GIF galleries, live demo sites, recorded tutorials, star-history curves and A/B variance numbers are B-tier assets — if you don't have them, the section gets deleted rather than downgraded into adjectives. `references/evidence.md` maps every one of his devices onto an A-tier replacement a 0-star repo can produce today: reproducible file-level numbers, double-clickable example files, ASCII wireframes.

`scripts/check-readme.mjs` turns the rules into 24 static checks plus per-link status probes you opt into (exit code CI-friendly). It was validated by discrimination, not by taste: 8 of 9 canonical samples score 0 FAIL, all four off-style repos score 2-4 FAIL, and a deliberately planted fixture (dead anchor, generic heading, hollow adjective, real local path, unfilled placeholder, unbalanced `<div>`) gets caught on every item. The GitHub heading-slug implementation is verified 52/52 against rendered anchors from two real repos, so full-width CJK punctuation doesn't produce false positives.

Sample material belongs to its authors and stays under each source repository's MIT license; quoted sentences are attributed inline, no README is reproduced in full, and no visual assets are used. This project is unaffiliated with and not endorsed by alchaincyf.

**Install**: `npx skills add <owner>/write-attractive-readme`
