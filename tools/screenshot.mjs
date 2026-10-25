/**
 * 端到端验收脚本（Playwright）
 * 用途：逐页访问 + 模拟真实操作，收集控制台错误，并保存用于实验报告的截图。
 * 运行：node tools/screenshot.mjs   （需要先启动 npm run preview，端口 4173）
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../screenshots')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'
mkdirSync(OUT, { recursive: true })

const problems = []
const shots = []

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 })

page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    problems.push(`[console.${msg.type()}] ${msg.text()}`)
  }
})
page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message}`))

async function shot(name) {
  const file = `${OUT}/${name}.png`
  await page.screenshot({ path: file })
  shots.push(name)
  console.log('  📸', name)
}

async function go(hash) {
  await page.goto(`${BASE}/#${hash}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(650)
}

console.log('▶ 1. 首页')
await go('/')
await shot('01-home')

console.log('▶ 2. 一键登录')
await page.getByRole('button', { name: '一键登录' }).click()
await page.waitForTimeout(500)
await shot('02-login-toast')

console.log('▶ 3. 市场列表')
await go('/market')
await page.waitForTimeout(600)
await shot('03-market')

console.log('▶ 4. 搜索 + 分类筛选')
await page.fill('.searchbar__input', '考研')
await page.waitForTimeout(900)
await shot('04-market-search')

console.log('▶ 5. 排序 + 列表视图')
await page.selectOption('.toolbar__select >> nth=0', 'priceAsc')
await page.click('.segmented button >> nth=1')
await page.waitForTimeout(600)
await shot('05-market-list-view')

console.log('▶ 6. 清空条件后收藏一件商品')
await page.click('text=清空条件')
await page.waitForTimeout(600)
await page.click('.item-card >> nth=0 >> .fav')
await page.waitForTimeout(500)

console.log('▶ 7. 商品详情')
await page.click('.item-card >> nth=0')
await page.waitForTimeout(800)
await shot('06-detail')

console.log('▶ 8. 发表评价')
await page.fill('.comment-form input >> nth=0', '数信01班同学')
await page.fill('.comment-form textarea', '书保存得很好，卖家很守时，在图书馆门口就完成了交易，推荐！')
await page.waitForTimeout(200)
await shot('07-detail-comment-form')
await page.click('text=发表评价')
await page.waitForTimeout(700)
await shot('08-detail-comment-done')

console.log('▶ 9. 下单弹窗')
await page.click('text=我想要，联系卖家')
await page.waitForTimeout(600)
await shot('09-order-modal')
await page.click('text=再想想')
await page.waitForTimeout(400)

console.log('▶ 10. 发布闲置')
await go('/publish')
await page.fill('input[placeholder*="罗技"]', '九成新 罗技 M330 静音鼠标（自用一年）')
await page.selectOption('.pub-form select >> nth=0', 'digital')
await page.fill('.pub-form input[type=number] >> nth=0', '45')
await page.fill('.pub-form input[type=number] >> nth=1', '99')
await page.click('.checks label >> nth=1')
await page.fill('.pub-form textarea', '去年买的鼠标，一直放在宿舍用，手感静音，附接收器和备用电池，可在二食堂门口面交。')
await page.fill('input[placeholder*="QQ"]', 'wx123456')
// 联系方式用了 v-model.lazy（只在 change / 失焦时同步），所以要手动触发失焦
await page.keyboard.press('Tab')
await page.waitForTimeout(400)
await shot('10-publish-form')
await page.click('button[type=submit]')
await page.waitForTimeout(1400)
await shot('11-publish-success')
await page.click('text=查看商品详情')
await page.waitForTimeout(900)
await shot('12-publish-result-detail')

console.log('▶ 11. 我的收藏')
await go('/favorites')
await page.waitForTimeout(600)
await shot('13-favorites')

console.log('▶ 12. Vue 实验室：响应式演示')
await go('/lab')
await shot('14-lab-reactivity')
await page.fill('input[placeholder="改个昵称试试"]', '南华大学·数信01班')
await page.waitForTimeout(400)

console.log('▶ 13. Vue 实验室：计算属性 / 侦听器')
await page.click('.lab-nav__item >> nth=1')
await page.waitForTimeout(700)
await shot('15-lab-computed')
await page.fill('input[placeholder="输入内容观察日志"]', '观察 watch 的 deep 侦听')
await page.waitForTimeout(600)

console.log('▶ 14. Vue 实验室：插槽 / 作用域插槽')
await page.click('.lab-nav__item >> nth=7')
await page.waitForTimeout(700)
await shot('16-lab-slot')

console.log('▶ 15. Vue 实验室：异步组件 + Suspense')
await page.click('.lab-nav__item >> nth=9')
await page.waitForTimeout(700)
await page.click('text=加载异步组件')
await page.waitForTimeout(300)
await shot('17-lab-async-loading')
await page.waitForTimeout(1600)
await shot('18-lab-async-done')

console.log('▶ 16. 实验室：卸载演示组件（观察生命周期）')
await page.click('.lab-nav__item >> nth=5')
await page.waitForTimeout(900)
await page.click('text=卸载演示组件')
await page.waitForTimeout(700)
await shot('19-lab-unmounted')

console.log('▶ 17. 关于页')
await go('/about')
await shot('20-about')
await page.evaluate(() => window.scrollTo(0, 700))
await page.waitForTimeout(600)
await shot('21-about-knowledge')

console.log('▶ 18. 深色模式 + 移动端视图')
await page.click('.theme-toggle')
await page.waitForTimeout(600)
await shot('22-dark-mode')

console.log('▶ 19. 404 页面')
await go('/a-page-that-not-exists')
await shot('23-notfound')

console.log('\n▶ 20. 移动端 375x812 首页 + 市场')
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await mobile.goto(`${BASE}/#/`, { waitUntil: 'networkidle' })
await mobile.waitForTimeout(900)
await mobile.screenshot({ path: `${OUT}/24-mobile-home.png` })
shots.push('24-mobile-home')
await mobile.click('.burger')
await mobile.waitForTimeout(500)
await mobile.screenshot({ path: `${OUT}/25-mobile-menu.png` })
shots.push('25-mobile-menu')

await browser.close()

console.log('\n================ 验收结果 ================')
console.log('截图数量：', shots.length)
console.log('控制台错误/警告：', problems.length)
for (const p of problems.slice(0, 40)) console.log('  ⚠️', p)
if (!problems.length) console.log('  ✅ 没有任何控制台错误或警告')