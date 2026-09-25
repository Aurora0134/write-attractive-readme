#!/usr/bin/env node
// README 校验器：把「花叔风格 README」的硬规则变成可复算的检查。
// 用法：node check-readme.mjs <README.md> [--http]
//   --http  额外用 curl 探测 badge / 外链状态码（需联网；本机有 DNS 污染时先按公共 DNS 核对）
// 退出码：0 = 无 FAIL；1 = 有 FAIL。WARN 不阻塞，但要求人工判断。

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
if (!file) { console.log('用法: node check-readme.mjs <README.md> [--http]'); process.exit(2); }
const wantHttp = args.includes('--http');

const src = fs.readFileSync(file, 'utf8');
const L = src.split('\n');
const results = [];
const add = (lvl, code, msg) => results.push({ lvl, code, msg });

// ---- GitHub 锚点算法（对 huashu-design / nuwa-skill 渲染结果实测 52/52 命中）----
export function slugify(t) {
  return String(t).toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/`/g, '')
    .replace(/[^\p{L}\p{N}\- ]/gu, '')
    .replace(/ /g, '-');
}
const headingText = l => l.replace(/^#+\s+/, '')
  .replace(/\*\*|__|\*/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/`/g, '')
  .trim();

const headings = L.filter(l => /^#{1,6}\s/.test(l)).map(headingText);
const slugSet = new Map();
for (const h of headings) {                       // GitHub 对重名标题追加 -1 / -2
  const base = slugify(h);
  let s = base, n = 0;
  while (slugSet.has(s)) { n++; s = base + '-' + n; }
  slugSet.set(s, h);
}

// ---- 1. hero 结构 ----
const hero = L.slice(0, 20).join('\n');
add(/align="center"/.test(hero) ? 'PASS' : 'FAIL', 'hero/centered',
  '<div align="center"> 需在文件前 20 行内（10/10 样本命中）');

const hookIdx = L.findIndex(l => /^>\s*\*{0,2}[「"“]/.test(l));
if (hookIdx < 0) add('FAIL', 'hero/hook', '缺 `> *「一句钩子」*`：断言式或反常识式，别写功能描述');
else {
  const hook = L[hookIdx].replace(/^>\s*\*{0,2}/, '').replace(/[*\s]+$/, '');
  const len = hook.replace(/[「」*]/g, '').length;
  add(len <= 40 ? 'PASS' : 'WARN', 'hero/hook-len', `钩子 ${len} 字：${hook.slice(0, 50)}（超 40 字就不像标语了）`);
}

const badges = L.filter(l => /^\[!\[|\[!\[[^\]]*\]\(/.test(l.trim())).length;
const badgeInline = (src.match(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g) || []).length;
const bTot = Math.max(badges, badgeInline);
add(bTot >= 3 && bTot <= 6 ? 'PASS' : 'WARN', 'hero/badges', `badge ${bTot} 个（3-6 为宜；License 放第一个）`);

const openDiv = (src.match(/<div\b/g) || []).length, closeDiv = (src.match(/<\/div>/g) || []).length;
add(openDiv === closeDiv ? 'PASS' : 'FAIL', 'hero/div-balance', `<div> ${openDiv} 开 / ${closeDiv} 闭（不配对 GitHub 会把后文吞进居中块）`);

const valueLine = L.slice(0, 60).some(l => /^\*\*[^*]{12,140}\*\*$/.test(l.trim()));
add(valueLine ? 'PASS' : 'FAIL', 'hero/value', '缺居中加粗的一句话价值主张（独立成行）');

const navRow = L.findIndex(l => /^\[[^\]]+\]\(#[^)]+\)(\s*[·|•]\s*\[[^\]]+\]\(#[^)]+\)){2,}/.test(l.trim()));
add(navRow >= 0 ? 'PASS' : 'WARN', 'hero/nav', '缺导航锚点行 `[看效果](#..) · [安装](#..) · ...`（8/10 样本有，读者靠它跳读）');

// ---- 2. 锚点死链 ----
const dead = [];
for (const m of src.matchAll(/\[([^\]]+)\]\(#[^)]*?([^)\s#]+)\)/g)) {
  const slug = m[2].replace(/^user-content-/, '');
  if (!slugSet.has(slug) && !slugSet.has(slugify(slug))) dead.push(`[${m[1]}](#${slug})`);
}
add(dead.length === 0 ? 'PASS' : 'FAIL', 'links/anchors',
  dead.length ? `死锚点 ${dead.length} 个：${dead.slice(0, 5).join(' ')}` : `全部 ${slugSet.size} 个页内锚点可解析`);

// ---- 3. 必备节 ----
const EFFECT_RE = /效果|demo|看效果|画廊|gallery|示例|输出|判分|跑通|case|showcase|proof|样例/i;
const need = [
  ['效果', EFFECT_RE, '先看效果再谈安装：7/8 可测样本把效果节放在安装节之前'],
  ['安装', /安装|install|装上就能用/i, ''],
  ['机制', /机制|原则|工作原理|怎么造|工作流|流程/i, ''],
  ['License', /license|许可证/i, ''],
];
// 只按同义词判，不做「第一个节里有代码块」那种结构兜底：hero 的一行安装命令本身就是代码块，会永远命中。
for (const [name, re, note] of need) {
  const hit = headings.some(h => re.test(h));
  add(hit ? 'PASS' : 'WARN', 'section/' + name, hit ? '' : `缺「${name}」节。${note}`);
}

// 诚实度：独立局限节 或 inline 负面结论，两种样本写法都算过关
const limHead = headings.some(h => /limitation|局限|诚实|做不到|边界|反例|风险|排错/i.test(h));
const negCount = (src.match(/做不到|不支持|不支持的|不行|❌|无法|干不了|负面结论|会掉到|不能|限制/g) || []).length;
if (limHead && negCount >= 1) add('PASS', 'section/honesty', `局限节 + ${negCount} 处负面结论`);
else if (negCount >= 2) add('WARN', 'section/honesty', `无独立局限节，但 ${negCount} 处 inline 负面结论——样本里两种写法都有（huashu-chrome 把「❌ 做不到」写进表格最后一行）`);
else add('FAIL', 'section/honesty', `既无局限节也无负面结论（inline 命中 ${negCount}）——读者无法判断边界在哪的 README 不被信任，这是全套规则里唯一没有例外的一条`);
const effectIdx = L.findIndex(l => /^#{2,3}\s/.test(l) && EFFECT_RE.test(l));
const installIdx = L.findIndex(l => /^#{2,3}\s.*(安装|install|装上就能用)/i.test(l));
if (effectIdx > 0 && installIdx > 0)
  add(effectIdx < installIdx ? 'PASS' : 'WARN', 'order/effect-first',
    effectIdx < installIdx ? '' : '安装节在效果节之前（读者还没看到东西就被要求装）');

// ---- 4. 证据可信度 ----
const hollow = [...src.matchAll(/强大|极致|完美|海量|一键|无缝|优雅|颠覆|赋能|打造/g)];
add(hollow.length === 0 ? 'PASS' : hollow.length <= 2 ? 'WARN' : 'FAIL', 'voice/hollow-adjectives',
  hollow.length ? `${hollow.length} 处空泛形容词（${[...new Set(hollow.map(m => m[0]))].join('、')}）——10 个样本合计仅 7 处 / 2738 行，用数字或实物替换` : '零空泛形容词');

const claim = /(实测|校验通过|零依赖|无外部|复算|自检)/.test(src);
const repro = /```[\s\S]{0,600}?(wc -l|grep|node |git |npx |curl )[\s\S]*?```/.test(src);
add(!claim ? 'PASS' : repro ? 'PASS' : 'FAIL', 'evidence/reproducible',
  claim ? (repro ? '有可复算命令块' : '文中出现「实测/零依赖/校验」类断言，但没给读者复算命令') : '未做需复算的断言');

const risky = [];
if (/\.gif|\.mp4/i.test(src)) risky.push('动图/视频');
if (/star-history/i.test(src)) risky.push('Star History 图');
if (/\b\d[\d,\.k]*\s*(stars?|star|用户|下载量)/i.test(src)) risky.push('star/用户数');
if (/youtube\.com|bilibili\.com|空间|公众号/i.test(src)) risky.push('教程/账号链接');
add(risky.length ? 'WARN' : 'PASS', 'evidence/assets',
  risky.length ? `出现需要真实资产支撑的表述：${risky.join('、')}——逐个确认存在且属于本仓库，0 star 新仓库不要借用` : '无需外部资产的证据');

const priv = [...src.matchAll(/(?:[A-Za-z]:[\\/]{1,2}Users[\\/]|\/Users\/|\/home\/|Desktop[\\/]|\.local\/|\\\\u003c|<[a-z]+>\s*邮箱|示例\.com\/[a-z0-9]{6,})/gi)];
add(priv.length ? 'FAIL' : 'PASS', 'privacy/paths', priv.length ? `${priv.length} 处疑似本机真实路径/占位残留` : '无本机路径泄漏');

const todo = [...src.matchAll(/TODO:|FIXME|\{\{[^}]+\}\}/g)];
add(todo.length ? 'FAIL' : 'PASS', 'lint/placeholders', todo.length ? `${todo.length} 处未替换的占位/TODO` : '无占位残留');

// ---- 5. 语气装置命中数（样本实测区间）----
const dash = (src.match(/——/g) || []).length;
const rhetorical = (src.match(/？/g) || []).length;
const boldPara = L.filter(l => /^\*\*[^*]{4,}\*\*/.test(l.trim())).length;
const notBut = (src.match(/不是[^。，、\n]{1,20}[，,]\s*(而?是|就?是|它|那)/g) || []).length;
add(dash >= 4 ? 'PASS' : 'WARN', 'voice/dash', `破折号补刀 ${dash} 处（样本 4-59，太少读起来像文档不像人话）`);
add(notBut >= 1 ? 'PASS' : 'WARN', 'voice/not-but', `「不是 X，是 Y」句式 ${notBut} 处（22 处 / 10 样本，是定位差异的主力句式）`);
add(boldPara >= 2 ? 'PASS' : 'WARN', 'voice/bold', `独立加粗断言行 ${boldPara} 处（样本 1-19）`);

const generic = headings.filter(h => /^(功能|特性|功能特性|简介|项目介绍|项目说明|使用说明|常见问题|FAQ|目录|其他)$/.test(h.replace(/\s/g, '')));
add(generic.length ? 'WARN' : 'PASS', 'voice/headings',
  generic.length ? `泛化标题 ${generic.length} 个：${generic.join('、')}——样本标题写成断言句（「一次说完，别来回八趟」「脚本是眼睛，不是大脑」）` : '标题无泛化命名');

const en = /(^|\n)#+\s*English|\*\*English\*\*/.test(src);
add(en ? 'PASS' : 'WARN', 'section/english', en ? '有 English 节/双语切换行' : '无 English 节（样本里仅 2/10 有；只在国际用户会来的项目才值得补，别为凑骨架硬写）');

const lim = L.length;
add(lim >= 200 && lim <= 600 ? 'PASS' : 'WARN', 'lint/length', `${lim} 行（样本 canonical 区间 274-560 行；短于 200 通常证据不足，长于 600 读者读不完）`);

// ---- 6. 可选：链接状态码 ----
if (wantHttp) {
  // Windows 注意：mingw curl 不认 /dev/null（exit 2），必须给真实临时文件路径。
  const os = await import('os');
  const sink = path.join(os.tmpdir(), 'readme-check-sink.bin');
  const urls = new Set([...src.matchAll(/\((https?:\/\/[^)\s]+)\)/g)].map(m => m[1]));
  for (const u of [...urls].slice(0, 25)) {
    let code = 'ERR';
    try {
      code = execFileSync('curl', ['-s', '-o', sink, '-w', '%{http_code}', '--ssl-no-revoke', '-m', '12', '-L', u],
        { encoding: 'utf8' }).trim();
    } catch { code = 'ERR'; }
    if (code === 'ERR') add('WARN', 'http', `探测失败 ${u.slice(0, 80)} —— 先分清是链接坏了还是本机 DNS 污染：nslookup img.shields.io 223.5.5.5 取真实 IP 后 curl --resolve 再试`);
    else add(/^([23]\d\d)$/.test(code) ? 'PASS' : 'FAIL', 'http', `${code}  ${u.slice(0, 90)}`);
  }
  try { fs.unlinkSync(sink); } catch {}
}

// ---- 输出 ----
const order = { FAIL: 0, WARN: 1, PASS: 2 };
results.sort((a, b) => order[a.lvl] - order[b.lvl]);
const cnt = k => results.filter(r => r.lvl === k).length;
for (const r of results) {
  let msg = r.msg || 'ok';
  if (r.lvl === 'PASS') msg = /^(缺|泛化|超)/.test(msg) ? 'ok' : msg.replace(/（[^）]*）/g, '');
  if (!msg) msg = 'ok';
  console.log(`${r.lvl.padEnd(4)} ${r.code.padEnd(24)} ${msg}`);
}
console.log(`\n${path.basename(file)}: ${cnt('FAIL')} FAIL / ${cnt('WARN')} WARN / ${cnt('PASS')} PASS`);
process.exit(cnt('FAIL') ? 1 : 0);
