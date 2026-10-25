/**
 * 开启（或检查）GitHub Pages，并轮询公网地址是否已经可以访问。
 * 用法：GITHUB_TOKEN=ghp_xxx node tools/enable-pages.mjs
 * 说明：GitHub 的「首次开启 Pages」接口偶尔会返回 500，这里会自动重试几次。
 */
const TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.REPO_NAME || 'nanhua-yitao'
const OWNER = process.env.REPO_OWNER

if (!TOKEN) {
  console.error('❌ 缺少 GITHUB_TOKEN')
  process.exit(1)
}

const API = 'https://api.github.com'
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'nanhua-yitao-pages',
  'Content-Type': 'application/json',
}

const me = await (await fetch(`${API}/user`, { headers })).json()
const login = OWNER || me.login
const site = `https://${login}.github.io/${REPO}/`
console.log(`👤 ${login}  🌐 ${site}\n`)

// 1. 尝试开启 Pages（已开启会返回 409，可忽略）
for (let i = 1; i <= 4; i++) {
  const res = await fetch(`${API}/repos/${login}/${REPO}/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ source: { branch: 'gh-pages', path: '/' } }),
  })
  const text = await res.text()
  console.log(`第 ${i} 次开启 Pages → HTTP ${res.status} ${text.slice(0, 120)}`)
  if (res.ok || res.status === 409) break
  await new Promise((r) => setTimeout(r, 4000))
}

// 2. 查看 Pages 状态
const status = await (await fetch(`${API}/repos/${login}/${REPO}/pages`, { headers })).json()
console.log('\nPages 状态：', JSON.stringify({
  status: status.status,
  html_url: status.html_url,
  branch: status.source?.branch,
  build_type: status.build_type,
}, null, 0))

// 3. 轮询公网地址
console.log('\n轮询公网地址（最多 12 次 × 15 秒）：')
for (let i = 1; i <= 12; i++) {
  try {
    const res = await fetch(site, { redirect: 'follow' })
    const html = res.ok ? await res.text() : ''
    const okApp = html.includes('/assets/') && html.includes('nanhua-yitao')
    console.log(`  ${i}. HTTP ${res.status}${okApp ? ' ✅ 页面与资源引用正常' : ''}`)
    if (res.ok && okApp) {
      console.log('\n🎉 网站已上线：', site)
      // 再确认一次静态资源真的能取到
      const asset = html.match(/src="(\/nanhua-yitao\/assets\/[^"]+\.js)"/)?.[1]
      if (asset) {
        const a = await fetch(`https://${login}.github.io${asset}`)
        console.log(`  静态资源 ${asset} → HTTP ${a.status}`)
      }
      process.exit(0)
    }
  } catch (err) {
    console.log(`  ${i}. 请求失败：${err.cause?.code || err.message}`)
  }
  await new Promise((r) => setTimeout(r, 15000))
}
console.log('\n⚠️ 还没就绪：首次发布通常需要 1~3 分钟，稍后直接访问上面的地址即可。')
console.log('   若超过 10 分钟仍 404，请到仓库 Settings → Pages 确认 Source 选的是 gh-pages 分支。')