# 证据分级——有吸引力不等于不可信

花叔的 README 有吸引力，不是因为句式，是因为**每句断言背后都能点进去一个东西**。这套方法可复制；他用来兑现的资产不可复制。这一份文件管这个差。

## 三级证据

**A 级 · 读者可当场复算** —— 最便宜也最强，任何仓库都有。
文件行数、脚本输出的实测数字、锚点/机制计数、零外部依赖的 grep 命中数、可双击打开的示例文件、可重跑的命令。
写成断言 + 复算命令两件套：

```
单文件零依赖：grep -c 'http' README.md 之外，全仓 assets/template.html 里
外部资源引用 0 处 —— 复算：
  grep -c 'src=\|href="http\|@import\|cdn' assets/template.html   # → 0
```

**B 级 · 需要真实资产支撑** —— 有就写，没有就整节删。
GIF / MP4 画廊、带音效的 live demo 站、亲录教程视频、Star History 曲线、A/B 实验方差数字、社区翻译版本表、二维码、平台账号表。

**C 级 · 无法核实** —— 一律不写。
「数百开发者在用」「性能提升 50%」（无测法）、「业界领先」、从别处借的截图、把会话日志或私人路径当示例、0 star 仓库放 Star History 空图。

## 花叔的证据装置 → 0-star 仓库的替代物

| 他的装置 | 隐含前提 | 你没有时换成 |
|---|---|---|
| hero GIF + 「每一个动画都是它自己做的」 | 会做 HTML 动画且有产物 | A 级：仓库内可双击打开的 `examples/*.html`，README 里写清「克隆后直接双击这个文件」 |
| 带音效的 live demo 站 | 已部署、有域名 | 同上；或截图（截图也要真） |
| YouTube / B 站亲录教程 | 有账号、愿意露身份 | 删。别用「文档更详细」占位 |
| Star History 图 | 有 star 增长 | 删。0 star 图 = 自报没人用 |
| A/B 测试方差数字（「v2 稳定性方差比 v1 低 5 倍」） | 真跑过 12 次对照 | 换成文件级实测数字，并把复算命令贴出来 |
| 「14,495 stargazers 真实曲线（gh API 拉取）」（huashu-design 原文） | 数字是真的 | 换成 `gh api repos/<owner>/<repo> --jq .license.spdx_id` 这类读者能自证的核对点 |
| 社区翻译版本表 | 有社区 fork | 删 |
| 关于作者平台表 + 二维码 | 他需要流量 | 换成「反馈与贡献」节：怎么提 issue、什么算 bug、什么算提案 |
| 「起源」第一人称故事 | 他愿意讲自己 | 可以写，但只讲机制与判断（哪个方案被推翻、为什么），不讲身份与经历 |

## 硬红线（发布前逐条查）

1. **不许出现无法当场复算的数字。** 写不出复算命令的数字就删。
2. **不许借用不属于本仓库的视觉资产**，包括自己另一个项目的 GIF。
3. **示例数据必须脱敏**：真实项目名、账号、内部路径、客户名、注册表键、专有文件名全部换成中性物。做法是写一个替换脚本，每对映射要求在原文件中**唯一命中**（`src.split(from).length - 1 !== 1` 就报错停下），替换完再 grep 一轮私有 token 计数，输出 `residual private tokens: 0`。
4. **`.gitignore` 会把示例文件悄悄吃掉。** 用裸文件名（`task-window.html`）ignore 会连带忽略 `examples/task-window.html`，即 README 唯一的视觉证据。上线前跑一次 `git check-ignore -v <每个示例路径>`，并把这条检查写进 README 的发布前清单。
5. **badge URL 要先测状态码**：含 `://` 的 label 必须 URL-encode，否则 shields.io 返 400。`node scripts/check-readme.mjs README.md --http` 会逐条探测。
   Windows 坑：curl 走 Node 子进程时 `-o /dev/null` 会 exit 2（MSYS 的路径转换只在 bash 里生效），脚本已改用真实临时文件承接响应体。探测报 `ERR` 时先分清是链接坏了还是本机 DNS 污染：`nslookup img.shields.io 223.5.5.5` 拿真实 IP，再 `curl --resolve` 复测，不要顺手写成「外链失效」。
6. **README 里出现的每个页内锚点都要能解析**（尤其中文标题带全角标点时，GitHub 的 slug 会把 `，` `·` `→` 直接删掉、空格转 `-`，不折叠重复连字符）。
7. **量化承诺必须实测**：方案/文案里任何「N 行 / N 个 / 减少 X%」都先跑脚本量出来，不要估。

## 交付前的 30 秒人肉测试

把 README 只滚到 hero，问三个问题：它是什么？给谁用？凭什么信？
第三问答不上来 → 缺 A 级证据，回去补可复算命令；
第二问答不上来 → 问题陈述段写成了功能列表；
第一问答不上来 → 一句话价值主张那行在抒情。

## 发布后核对（别只信本地）

```
gh api repos/<owner>/<repo>/git/trees/main?recursive=1 --jq '.tree[] | [.path, .size] | @tsv'
gh api repos/<owner>/<repo> --jq '{license: .license.spdx_id, stars: .stargazers_count, visibility: .private}'
gh api repos/<owner>/<repo>/readme -H "Accept: application/vnd.github.html" | grep -c 'user-content-'
```
注意：HTML 变体的响应是原始 HTML 不是 JSON，`--jq '.content'` 会失败；GitHub 渲染后的锚点 id 全部带 `user-content-` 前缀，比对死链时先剥掉。
