import { fileURLToPath, URL } from 'node:url'
import { readdirSync, statSync } from 'node:fs'

function walk(dir, acc) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return acc
  }
  for (const entry of entries) {
    if (entry === '.DS_Store' || entry.startsWith('.')) continue
    const full = dir + '/' + entry
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (entry.endsWith('.html')) acc.push(full)
  }
  return acc
}

function entriesFromDirs(dirs, prefix) {
  const input = {}
  for (const d of dirs) {
    const files = walk(d, [])
    for (const file of files) {
      if (file.endsWith('index.html') && d.endsWith('blog')) {
        input[file.replace(/\.html$/, '')] = fileURLToPath(new URL('./' + file, import.meta.url))
        continue
      }
      input[file.replace(/\.html$/, '')] = fileURLToPath(new URL('./' + file, import.meta.url))
    }
  }
  return input
}

export default {
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        en: fileURLToPath(new URL('./en.html', import.meta.url)),
        ...entriesFromDirs(['servicios', 'zonas', 'blog', 'en/servicios', 'en/zonas', 'en/blog'])
      }
    }
  }
}