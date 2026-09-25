# 语料与实测数据——本 skill 的证据从哪来，怎么重新校准

所有数字来自 2026-09-25 用 `gh api` 抓取 alchaincyf 公开仓库 README 后的本地脚本统计，不含估计值。用户点名的基准就是这个账号的高 star 项目；样本、判定与复算命令全部留在这里，便于日后重新校准。

## 复算：抓语料

```bash
# 1) 按 star 排序列仓库（今天的前 6 名见下表）
gh api "users/alchaincyf/repos?per_page=100" \
  --jq '.[] | [.stargazers_count, .forks_count, .name, .language, .pushed_at] | @tsv' | sort -rn

# 2) 抓单个 README 原文
gh api "repos/alchaincyf/<repo>/readme" -H "Accept: application/vnd.github.raw" > <repo>.md

# 3) 抓渲染后的 HTML 拿真实锚点 id（验证 slugify 用）
gh api "repos/alchaincyf/<repo>/readme" -H "Accept: application/vnd.github.html" > <repo>.html
grep -o 'id="user-content-[^"]*"' <repo>.html
```

## 样本清单（★ = 抓取当日）

| 仓库 | ★ | 档 | 是否计入 canonical |
|---|---|---|---|
| nuwa-skill | 33,187 | A 能力型 skill | ✅ |
| huashu-design | 24,436 | A | ✅ |
| zhangxuefeng-skill | 10,336 | B 生成物型 | ✅ |
| darwin-skill | 6,089 | A | ✅ |
| x-mentor-skill | 1,120 | B | ✅ |
| fanbox | 1,016 | C 产品/App 型 | ✅（作为对照档） |
| huashu-md-html | 908 | A | ✅ |
| steve-jobs-skill | 949 | B | ✅ |
| huashu-excel | 420 | A | ✅ |
| huashu-chrome | 234 | A（结构最完整，机制叙述最细） | ✅ |
| hermes-agent-orange-book | 4,954 | 书/文档型 | ❌ 离群：无 hero、无 badge、无导航行 |
| huashu-skills | 1,610 | 目录索引型 | ❌ 离群：16 张表，零 hero |
| huashu-report | 423 | 极简型（89 行） | ❌ 离群 |
| img2046 | 218 | 普通工具站 | ❌ 离群：含「强大的」「打造」 |

「风格离群」不是主观判断：这 4 个在 `居中hero / badge 行 / 导航锚点行 / npx skills add` 四项上命中率为 0%，而 A/B 档命中率为 80-100%。

## 许可核对（2026-09-25）

上表 14 个仓库的 LICENSE 全部经 GitHub license 端点核对为 **MIT**，版权人 `Copyright (c) 2026 alchaincyf (花叔 · 花生)`（MIT 定义里的 Software 包含 associated documentation files，README 在被许可范围内）。逐仓复算：

```bash
for r in nuwa-skill huashu-design darwin-skill zhangxuefeng-skill steve-jobs-skill \
         x-mentor-skill huashu-md-html huashu-excel huashu-chrome fanbox; do
  printf "%-20s " "$r"; gh api "repos/alchaincyf/$r/license" --jq '.license.spdx_id'
done
```

两个版本时点要注意：huashu-design 自 2026-05-14 起才是 MIT（此前是限制商用的 Personal Use License），hermes-agent-orange-book 第 1 版是 CC BY-NC-SA 4.0。协议变更一般不追溯到已发布的旧版本，所以**只从当日 HEAD 取材料**，别把旧条款下的文本当 MIT 材料再分发。

## 装置命中率（canonical n=10）

| 装置 | A/B 档 | 离群档 n=4 |
|---|---|---|
| 居中 hero `<div align="center">` | 100% | 0% |
| badge 行 | 100% | 0% |
| 反引号命令 | 100% | 50% |
| 自家项目互推 | 100% | 75% |
| 真实外部来源链接 | 100% | 50% |
| 仓库结构 tree | 80% | 0% |
| 「」钩子 | 80% | 0% |
| 导航锚点行 | 80% | 0% |
| 效果节 | 80% | 0% |
| `npx skills add` | 80% | 0% |
| 独立加粗价值行 | 90% | 25% |
| License 节 | 90% | 50% |
| 关于作者节 | 90% | 50% |
| 跨 agent / runtime 声明 | 70% | 25% |
| GIF/MP4 动图 | 70% | 50% |
| 耗时数字 | 50% | 50% |
| 居中收尾对句 | 50% | 0% |
| 竞品定位对比节 | 50% | 25% |
| 安装三方式 | 40% | 0% |
| 能做什么表 | 40% | 0% |
| 核心机制/原则节 | 30% | 0% |
| 起源/故事节 | 30% | 0% |
| 装完自检警告 | 30% | 50% |
| Star History | 20% | 0% |
| 显式 Limitations 节 | 20% | 0% |
| English 节 | 20% | 0% |

两点纠正直觉：**显式 Limitations 节只有 2/10**，但 10/10 都有 inline 负面结论（`huashu-chrome` 把 ❌ 做不到写进效果表最后一行，`huashu-design` 写成 `Limitations` 节）——所以诚实度按「有没有负面内容」判，不按「有没有那一节」判。**Star History 只有 2/10**，它不是骨架必需件。

## 其他实测数字

- 效果节排在安装节之前：8 个可测样本中 7 个（唯二例外是 `huashu-design`、`fanbox`，它们 hero 里已内嵌一行安装）。
- 空泛形容词（强大/极致/完美/海量/一键/无缝/优雅/颠覆/赋能/打造）：A 档 9 样本合计 7 处 / 2,738 行；`img2046` 155 行里 1 处 + 「打造」。
- 「不是 X，是 Y」句式：22 处 / 10 样本，`nuwa-skill` 单篇 6 处。
- 中文破折号 `——`：2-59 处（`huashu-chrome` 59、`huashu-excel` 29）。
- 行数：canonical 274-560 行，中位 ~330；离群 89-274 行。
- 数字 token 密度：`x-mentor-skill` 197、`huashu-design` 117、`darwin-skill` 112、`huashu-excel` 103（低者 `fanbox` 26 —— 双语档不靠数字密度取胜）。

## GitHub 锚点 slug 算法（已验证）

```js
const slug = t => t.toLowerCase()
  .replace(/<[^>]+>/g, '').replace(/`/g, '')
  .replace(/[^\p{L}\p{N}\- ]/gu, '')   // 删标点/emoji/全角符号，保留字母数字空格连字符
  .replace(/ /g, '-');                  // 空格转连字符，不折叠连续空格
```
对 `huashu-design` + `nuwa-skill` 全部 52 个 h1-h3 标题，与 GitHub 渲染出的 `id="user-content-*"` 命中 52/52，含 `📺 新手教程（花叔亲录）` → `-新手教程花叔亲录`、`信息图 / 数据可视化` → `信息图--数据可视化`、`（2.0）` → `20`。重名标题 GitHub 追加 `-1`/`-2`。

## 校验器判别力（同一份脚本跑全语料）

`node scripts/check-readme.mjs <file>`，2026-09-25 结果：

```
A/B 档：nuwa 0F/2W/22P · huashu-design 0/4/20 · darwin 0/9/14 · zhangxuefeng 0/3/21
        steve-jobs 0/5/19 · x-mentor 0/3/21 · huashu-excel 0/3/21 · huashu-chrome 0/3/21
        huashu-md-html 1F/3W/20（真缺边界声明，非规则误报）
C 档： fanbox 3F/8W/12
离群： huashu-report 4F · huashu-skills 4F · hermes-orange-book 2F · img2046 4F/13W/6
自建： build-with-html/README.md 0F/0W/24P
反向用例：故意埋死锚点 + 泛化标题 + 空泛形容词 + 本机路径 + TODO → 全部被抓出
```

## 重新校准流程

1. 重跑上面的 `gh api` 抓取，样本集换成当日 star 前 10 的非离群仓库（`description` 里带 `.skill` / `Agent Skill` 的优先）。
2. 跑装置命中率统计（本文件「复算：抓语料」三段命令 + 一个 grep 表）。
3. 若某装置命中率跌破 40%，从 `formula.md` 的必需件降级为可选件。
4. 用新 README 与老语料双向跑 `check-readme.mjs`：canonical 出现新 FAIL 说明规则过严，离群出现 0 FAIL 说明规则过松——两边都要改脚本，不要改样本迁就规则。
