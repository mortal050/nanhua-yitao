/**
 * 一键部署到 GitHub Pages
 *
 * 用法（PowerShell）：
 *   $env:GITHUB_TOKEN="ghp_xxx"; node tools/deploy-gh.mjs
 * 用法（bash）：
 *   GITHUB_TOKEN=ghp_xxx node tools/deploy-gh.mjs
 *
 * 它会依次完成：
 *   1. 用 token 查询账号，自动创建仓库（已存在则跳过）
 *   2. 提交源码到 main 分支并推送
 *   3. 以 BASE_PATH=/<仓库名>/ 构建，把 dist 作为 gh-pages 分支推送
 *   4. 调用 GitHub API 打开 Pages，输出最终公网地址
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const TMP = resolve(ROOT, '..', 'tmp', 'gh-pages-deploy')

const TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.REPO_NAME || 'nanhua-yitao'
if (!TOKEN) {
  console.error('❌ 请先设置 GITHUB_TOKEN 环境变量（GitHub → Settings → Developer settings → Personal access tokens，勾选 repo 权限）')
  process.exit(1)
}

const API = 'https://api.github.com'
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'nanhua-yitao-deploy',
  'Content-Type': 'application/json',
}

/**
 * Node 的 git 命令统一带上这两个参数：
 *   http.schannelCheckRevoke=false —— 国内网络常常连不上证书吊销列表，会报 CRYPT_E_NO_REVOCATION_CHECK
 *   http.sslVerify=false           —— 部分安全软件 / 代理会做 HTTPS 拦截，Git 用的 schannel 会校验失败
 * 它们只影响本脚本执行的 git 命令，不会改动你的全局 git 配置。
 * 若你的网络环境正常、想恢复严格校验，设置环境变量 GIT_STRICT_TLS=1 即可去掉后一个参数。
 */
const GIT_CONFIG_ARGS = ['-c', 'http.schannelCheckRevoke=false']
if (process.env.GIT_STRICT_TLS !== '1') GIT_CONFIG_ARGS.push('-c', 'http.sslVerify=false')
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: '0' }

// ---------------------------------------------------------------------------
// TLS 自愈：部分安全软件 / 代理会做 HTTPS 拦截，Node 默认 CA 会报
// UNABLE_TO_VERIFY_LEAF_SIGNATURE。Node 24 支持 --use-system-ca 改用系统证书库，
// 这里先探测一次，失败就自动带着该参数重新执行自己。
// ---------------------------------------------------------------------------
const SYSTEM_CA_FLAG = '--use-system-ca'

async function tlsProbe() {
  try {
    await fetch(`${API}/rate_limit`, { headers: { 'User-Agent': 'nanhua-yitao-deploy' } })
    return 'ok'
  } catch (err) {
    const code = err?.cause?.code || err?.code || ''
    return String(code).includes('CERTIFICATE') || String(code).includes('VERIFY') ? 'tls' : 'net'
  }
}

if (!process.execArgv.includes(SYSTEM_CA_FLAG)) {
  const probe = await tlsProbe()
  if (probe === 'tls') {
    console.log('🔐 检测到本机 HTTPS 证书校验失败（通常是安全软件 / 代理在做 TLS 拦截）')
    console.log('   正在自动改用系统证书库重试：node --use-system-ca …\n')
    const retry = spawnSync(process.execPath, [SYSTEM_CA_FLAG, fileURLToPath(import.meta.url)], {
      stdio: 'inherit',
      env: process.env,
      cwd: ROOT,
    })
    process.exit(retry.status ?? 1)
  } else if (probe === 'net') {
    console.error('❌ 无法连接 api.github.com，请检查网络（是否开了代理 / 需要科学上网）')
    process.exit(1)
  }
} else {
  const probe = await tlsProbe()
  if (probe !== 'ok') {
    console.error('❌ 即使使用系统证书库仍无法连接 GitHub API，请检查网络或代理设置')
    process.exit(1)
  }
}

async function api(path, options = {}) {
  const res = await fetch(API + path, { headers, ...options })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = { raw: text }
  }
  return { ok: res.ok, status: res.status, json }
}

function git(args, cwd = ROOT, opts = {}) {
  return execFileSync('git', [...GIT_CONFIG_ARGS, ...args], {
    cwd,
    encoding: 'utf8',
    env: GIT_ENV,
    stdio: opts.silent ? 'pipe' : 'inherit',
  })
}

/** 1. 账号 + 仓库 */
const me = await api('/user')
if (!me.ok) {
  console.error('❌ token 无效或权限不足：', me.status, me.json.message)
  process.exit(1)
}
const login = me.json.login
console.log(`👤 账号：${login}`)

const created = await api('/user/repos', {
  method: 'POST',
  body: JSON.stringify({
    name: REPO,
    description: '南华易淘 · 校园二手交易平台（Vue 3 + Vite + Vue Router + Pinia 课程实验）',
    private: false,
    has_issues: false,
    has_wiki: false,
    auto_init: false,
  }),
})
if (created.ok) console.log(`✅ 已创建仓库 ${login}/${REPO}`)
else if (created.status === 422) console.log(`ℹ️ 仓库 ${login}/${REPO} 已存在，继续推送`)
else {
  console.error('❌ 创建仓库失败：', created.status, created.json.message)
  process.exit(1)
}

const remote = `https://github.com/${login}/${REPO}.git`
const authedRemote = `https://x-access-token:${TOKEN}@github.com/${login}/${REPO}.git`

/** 2. 推送源码 */
if (!existsSync(resolve(ROOT, '.git'))) git(['init', '-b', 'main'])
// 为这个仓库设置提交者信息（不影响全局 git 配置）
git(['config', 'user.name', '吴星雨'], ROOT, { silent: true })
git(['config', 'user.email', `${login}@users.noreply.github.com`], ROOT, { silent: true })
git(['add', '-A'])
try {
  git(['commit', '-m', 'feat: 南华易淘校园二手交易平台（Vue 3 课程实验）'], ROOT, { silent: true })
} catch {
  console.log('ℹ️ 没有新的改动需要提交')
}
try {
  git(['remote', 'remove', 'origin'], ROOT, { silent: true })
} catch {}
git(['remote', 'add', 'origin', remote])
git(['push', '-u', authedRemote, 'main', '--force'])
console.log('✅ 源码已推送到 main 分支')

/** 3. 构建 + 推送 gh-pages */
console.log(`🔨 构建生产版本（base = /${REPO}/）…`)
const viteBin = resolve(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
if (existsSync(viteBin)) {
  // 直接用 node 跑 vite，避免 Windows 上 spawn npm.cmd 的 EINVAL 问题
  execFileSync(process.execPath, [viteBin, 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, BASE_PATH: `/${REPO}/` },
  })
} else {
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, BASE_PATH: `/${REPO}/` },
  })
}

rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })
cpSync(resolve(ROOT, 'dist'), TMP, { recursive: true })
writeFileSync(resolve(TMP, '.nojekyll'), '') // 让 GitHub Pages 不要用 Jekyll 处理静态资源
// Hash 路由下 404.html 很少被用到，但访问了不存在的路径时把用户送回站点首页
writeFileSync(
  resolve(TMP, '404.html'),
  `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>正在跳转…</title>
<script>location.replace('/${REPO}/#/')</script></head>
<body>正在返回首页…</body></html>`
)

git(['init', '-b', 'gh-pages'], TMP)
git(['add', '-A'], TMP)
git(['commit', '-m', 'build: 发布 gh-pages 静态站点'], TMP, { silent: true })
git(['push', authedRemote, 'gh-pages', '--force'], TMP)
console.log('✅ 构建产物已推送到 gh-pages 分支')

/** 4. 打开 Pages */
const pages = await api(`/repos/${login}/${REPO}/pages`, {
  method: 'POST',
  body: JSON.stringify({ source: { branch: 'gh-pages', path: '/' } }),
})
if (pages.ok) console.log('✅ 已开启 GitHub Pages')
else if (pages.status === 409) console.log('ℹ️ Pages 之前已经开启')
else console.log('⚠️ 开启 Pages 返回：', pages.status, pages.json.message, '（也可以在仓库 Settings → Pages 里手动选择 gh-pages 分支）')

const url = `https://${login}.github.io/${REPO}/`
console.log('\n================ 部署完成 ================')
console.log('🌐 公网地址：', url)
console.log('📦 仓库地址：', remote)
console.log('（首次发布可能需要 1~2 分钟生效）')