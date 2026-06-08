/**
 * App-wide static configuration (external links, resources).
 * Keep author/sponsor/repo links here so they can be updated in one place.
 */
import { version } from '../package.json'

export const appConfig = {
  /** App version number shown in Settings → About. Sourced from package.json. */
  version,
  /** App slogan / subtitle shown in Settings → About. Single brand string,
      not localized — adjust here if you need to change the tagline. */
  slogan: '坚持，是最好的学习方法',
  /** Open-source repository — "star to say thanks". */
  githubUrl: 'https://github.com/yezihack/stick-study',
  /** WeChat Pay QR shown in the sponsor dialog. */
  wechatQrUrl: '/wxpay.jpg'
} as const

/**
 * 百度统计（网站统计 hm.baidu.com）配置。
 *
 * App 为 Capacitor + WebView，加载本地 HTML，使用百度「网站统计」JS SDK
 * 即可，无需原生集成。集中放在此处便于统一维护。
 *
 * 接入文档：https://tongji.baidu.com/
 */
export const baiduTongjiConfig = {
  /**
   * 站点 id —— 即百度统计代码 `hm.js?` 后面的 token。
   * 在百度统计后台「管理 → 代码管理 → 获取代码」中复制。
   * 例如 hm.js?abcdef1234567890 中的 `abcdef1234567890`。
   */
  siteId: ''
} as const
