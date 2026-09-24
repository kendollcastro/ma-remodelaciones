import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const sha256 = (s) => 'sha256-' + createHash('sha256').update(s).digest('base64')

function inlineBlocks(html) {
  const scripts = [], styles = []
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc\s*=/i.test(m[1] || '')) continue
    scripts.push(m[2])
  }
  for (const m of html.matchAll(/<style(\s[^>]*)?>([\s\S]*?)<\/style>/g)) {
    if (/\bsrc\s*=/i.test(m[1] || '')) continue
    styles.push(m[2])
  }
  return { scripts, styles }
}

function policy(html, extraScriptHosts = [], extraConnectHosts = []) {
  const { scripts, styles } = inlineBlocks(html)
  const scriptHashes = scripts.map(sha256)
  const styleHashes = styles.map(sha256)
  const p = [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(' ')} ${extraScriptHosts.join(' ')}`.trim(),
    `style-src 'self' 'unsafe-inline' ${styleHashes.join(' ')} https://fonts.googleapis.com https://cdnjs.cloudflare.com`.trim(),
    `font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com`,
    `img-src 'self' data: https:`,
    `connect-src 'self' ${extraConnectHosts.join(' ')}`.trim(),
    "frame-src 'self' https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
  ].filter(Boolean)
  return p.join('; ')
}

const SCRIPT = ['https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://analytics.google.com']
const CONNECT = ['https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://analytics.google.com', 'https://maps.googleapis.com', 'https://formspree.io', 'https://lh3.googleusercontent.com']

for (const f of ['index.html', 'en.html']) {
  const html = readFileSync(f, 'utf8')
  const csp = policy(html, SCRIPT, CONNECT)
  const tag = `<meta http-equiv="Content-Security-Policy" content="${csp}"/>`
  if (/Content-Security-Policy/.test(html)) continue
  const out = html.replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/>\n' + tag)
  writeFileSync(f, out)
  console.log('===', f, '===')
  for (const s of inlineBlocks(html).scripts) console.log('  <script inline>', sha256(s).slice(0, 52) + '…')
  for (const s of inlineBlocks(html).styles) console.log('  <style inline>', sha256(s).slice(0, 52) + '…')
}
