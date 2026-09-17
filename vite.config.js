import { fileURLToPath, URL } from 'node:url'

export default {
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        en: fileURLToPath(new URL('./en.html', import.meta.url))
      }
    }
  }
}