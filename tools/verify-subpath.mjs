/**
 * 上线前预检：把 dist 当成 GitHub Pages 项目站点（子路径 /nanhua-yitao/）访问一遍，
 * 确认静态资源路径、Hash 路由、控制台都没有问题。
 */
import { chromium } from 'playwright'

const BASE = process.env.SIM_BASE || 'http://127.0.0.1:4174/nanhua-yitao/'
const problems = []

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`[console.${m.type()}] ${m.text()}`)
})
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => problems.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`))

for (const hash of ['/', '/market', '/item/ny-001', '/lab', '/about']) {
  await page.goto(`${BASE}#${hash}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const title = await page.title()
  const painted = await page.evaluate(() => document.querySelector('#app')?.children.length || 0)
  console.log(`  ${hash.padEnd(14)} → 标题「${title}」，#app 子节点 ${painted} 个`)
}
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
await page.screenshot({ path: '../screenshots/26-pages-subpath.png' })
console.log('  📸 26-pages-subpath')

await browser.close()
console.log('\n子路径预检：', problems.length ? `发现 ${problems.length} 个问题` : '✅ 无错误、无失败请求')
for (const p of problems.slice(0, 20)) console.log('  ⚠️', p)