// build-site.mjs
// Generador de páginas estáticas SEO para grupoma.cr (MA Soluciones Integrales)
// Leer páginas desde ./content/<es|en>/<tipo>/<slug>/  →  escribe HTML final en la raíz
// + regenera public/sitemap.xml. Se ejecuta automáticamente vía `prebuild`.
//
// Para agregar un artículo/blog nuevo:
//  1. Copiar content/es/blog/<slug>/ y content/en/blog/<slug>/
//  2. Editar meta.json (title, description, date, image, excerpt) y fragment.html
//  3. Ejecutar `npm run build`
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT = join(ROOT, 'content')
const SITE = 'https://www.grupoma.cr'

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://formspree.io https://maps.googleapis.com; frame-src 'self' https://www.googletagmanager.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io"

const TODAY = new Date().toISOString().slice(0, 10)
const LASTMOD = '2026-09-21'

const FACTS = {
  years: '16+',
  projects: '+300',
  satisfaction: '98%',
  allies: '+50',
  founding: '2010',
  phoneDisplay: '+(506) 8452-2328',
  phoneTel: '+50684522328',
  wa: 'https://wa.me/50684522328?text=Hola%2C%20quiero%20solicitar%20una%20cotizaci%C3%B3n',
  waPlain: 'https://wa.me/50684522328',
  email: 'grupomacrc@gmail.com',
  telRobert: '+50686649651',
}

const L = {
  es: {
    lang: 'es',
    ogLocale: 'es_CR',
    ogAlt: 'en_US',
    xDefault: SITE + '/',
    switchHref: (enPath) => SITE + '/en' + (enPath || ''),
    switchLabel: 'English',
    switchTitle: 'EN',
    topLoc: 'Jacó y todo el Pacífico Central, Costa Rica',
    topHours: 'Lun - Vie: 7 AM - 5 PM',
    nav: { home: 'Inicio', services: 'Servicios', projects: 'Proyectos', about: 'Nosotros', faq: 'FAQ', blog: 'Blog', quote: 'Cotizar Proyecto', contact: 'Contacto' },
    crumbHome: 'Inicio',
    crumbBlog: 'Blog',
    footer: {
      about: 'Empresa especializada en construcción, electricidad, remodelaciones y mantenimiento en el Pacífico de Costa Rica, con altos estándares de seguridad y calidad garantizada.',
      secciones: 'Secciones',
      soluciones: 'Soluciones',
      zonas: 'Zonas que Atendemos',
      blog: 'Blog',
      ubicacion: 'Ubicación y Área de Operaciones',
      mapTitle: 'Ubicación de MA Soluciones Integrales',
      mapNote: 'Base en Jacó, Garabito. Visitas técnicas programadas y atención inmediata en todo el Pacífico.',
      copyright: '© 2026 MA Soluciones Integrales. Todos los derechos reservados.',
      english: 'English',
      whatsapp: 'WhatsApp',
      llamar: 'Llamar',
      correo: 'Correo',
      inicio: 'Inicio',
      servicios: 'Servicios',
      proyectos: 'Proyectos',
      nosotros: 'Nosotros',
      testimonios: 'Testimonios',
    },
    cta: {
      kicker: 'Cotización Sin Compromiso',
      title: 'Hablemos de su Proyecto',
      text: 'Respuesta en menos de 48 horas con desglose de materiales, mano de obra, tiempos y garantías. Sin cargos ocultos.',
      wa: 'WhatsApp Directo',
      quote: 'Solicitar Cotización',
      phone: 'Llamar por Teléfono',
    },
    servicesLabel: 'Trabajamos En Estos Servicios',
    zonesLabel: 'Cobertura en el Pacífico',
    zonesNote: 'También atendemos en:',
    faqLabel: 'Preguntas Frecuentes',
    relatedLabel: 'Servicios Relacionados',
    moreBlog: 'Otros Artículos',
    readArticle: 'Leer artículo',
  },
  en: {
    lang: 'en',
    ogLocale: 'en_US',
    ogAlt: 'es_CR',
    xDefault: SITE + '/',
    switchHref: () => SITE + '/',
    switchLabel: 'Español',
    switchTitle: 'ES',
    topLoc: 'Jacó and the Central Pacific, Costa Rica',
    topHours: 'Mon - Fri: 7 AM - 5 PM',
    nav: { home: 'Home', services: 'Services', projects: 'Projects', about: 'About', faq: 'FAQ', blog: 'Blog', quote: 'Quote a Project', contact: 'Contact' },
    crumbHome: 'Home',
    crumbBlog: 'Blog',
    footer: {
      about: 'Construction, electrical, remodeling and maintenance company on the Pacific coast of Costa Rica, with high safety and quality standards.',
      secciones: 'Sections',
      soluciones: 'Services',
      zonas: 'Areas We Cover',
      blog: 'Blog',
      ubicacion: 'Location & Service Area',
      mapTitle: 'MA Soluciones Integrales location',
      mapNote: 'Based in Jacó, Garabito. Scheduled site visits and fast response across the Pacific.',
      copyright: '© 2026 MA Soluciones Integrales. All rights reserved.',
      english: 'Español',
      whatsapp: 'WhatsApp',
      llamar: 'Call',
      correo: 'Email',
      inicio: 'Home',
      servicios: 'Services',
      proyectos: 'Projects',
      nosotros: 'About',
      testimonios: 'Testimonials',
    },
    cta: {
      kicker: 'Free Quote',
      title: 'Let Us Talk About Your Project',
      text: 'Reply within 48 hours with a breakdown of materials, labor, timelines and warranties. No hidden costs.',
      wa: 'WhatsApp Direct',
      quote: 'Request a Quote',
      phone: 'Call Us',
    },
    servicesLabel: 'Services We Provide',
    zonesLabel: 'Pacific Coast Coverage',
    zonesNote: 'We also serve:',
    faqLabel: 'Frequently Asked Questions',
    relatedLabel: 'Related Services',
    moreBlog: 'More Articles',
    readArticle: 'Read article',
  },
}

const SERVICE_CATALOG = {
  es: {
    'construccion-general': { name: 'Construcción General', icon: 'fa-building', img: '/src/assets/obra_3.webp', tag: 'Gestión Llave en Mano' },
    electricidad: { name: 'Electricidad', icon: 'fa-bolt', img: '/src/assets/obra_6.webp', tag: 'Certificado' },
    remodelacion: { name: 'Remodelación', icon: 'fa-paint-roller', img: '/src/assets/obra_13.webp', tag: 'Acabados Premium' },
    mantenimiento: { name: 'Mantenimiento', icon: 'fa-screwdriver-wrench', img: '/src/assets/obra_15.webp', tag: 'Inspección In situ' },
    jardineria: { name: 'Jardinería', icon: 'fa-seedling', img: '/src/assets/obra_1.webp', tag: 'Riego Automático' },
    instalacion: { name: 'Instalación', icon: 'fa-toolbox', img: '/src/assets/obra_5.webp', tag: 'Montaje Especializado' },
    fontaneria: { name: 'Fontanería', icon: 'fa-faucet-drip', img: '/src/assets/obra_7.webp', tag: 'Sistemas Certificados' },
    'estructuras-metalicas': { name: 'Estructuras Metálicas', icon: 'fa-industry', img: '/src/assets/obra_10.webp', tag: 'Acero Certificado' },
  },
  en: {
    'construccion-general': { name: 'General Construction', icon: 'fa-building', img: '/src/assets/obra_3.webp', tag: 'Turnkey Management' },
    electricidad: { name: 'Electrical', icon: 'fa-bolt', img: '/src/assets/obra_6.webp', tag: 'Certified' },
    remodelacion: { name: 'Remodeling', icon: 'fa-paint-roller', img: '/src/assets/obra_13.webp', tag: 'Premium Finishes' },
    mantenimiento: { name: 'Maintenance', icon: 'fa-screwdriver-wrench', img: '/src/assets/obra_15.webp', tag: 'On-site Inspection' },
    jardineria: { name: 'Landscaping', icon: 'fa-seedling', img: '/src/assets/obra_1.webp', tag: 'Automatic Irrigation' },
    instalacion: { name: 'Installation', icon: 'fa-toolbox', img: '/src/assets/obra_5.webp', tag: 'Specialized Assembly' },
    fontaneria: { name: 'Plumbing', icon: 'fa-faucet-drip', img: '/src/assets/obra_7.webp', tag: 'Certified Systems' },
    'estructuras-metalicas': { name: 'Steel Structures', icon: 'fa-industry', img: '/src/assets/obra_10.webp', tag: 'Certified Steel' },
  },
}

const ZONE_CATALOG = {
  es: {
    jaco: { name: 'Jacó', img: '/src/assets/obra_5.webp', short: 'Centro turístico y residencial del Pacífico Central.' },
    garabito: { name: 'Garabito', img: '/src/assets/obra_10.webp', short: 'Cantón que incluye Jacó, Herradura y Playa Hermosa.' },
    quepos: { name: 'Quepos', img: '/src/assets/obra_13.webp', short: 'Puerto y zona turística cerca de Manuel Antonio.' },
    parrita: { name: 'Parrita', img: '/src/assets/obra_1.webp', short: 'Cantón agrícola y costero entre Quepos y Jacó.' },
    puntarenas: { name: 'Puntarenas', img: '/src/assets/obra_3.webp', short: 'Capital provincial con proyecto comercial e industrial.' },
  },
  en: {
    jaco: { name: 'Jacó', img: '/src/assets/obra_5.webp', short: 'Tourist and residential hub of the Central Pacific.' },
    garabito: { name: 'Garabito', img: '/src/assets/obra_10.webp', short: 'Canton including Jacó, Herradura and Playa Hermosa.' },
    quepos: { name: 'Quepos', img: '/src/assets/obra_13.webp', short: 'Port town near Manuel Antonio.' },
    parrita: { name: 'Parrita', img: '/src/assets/obra_1.webp', short: 'Coastal canton between Quepos and Jacó.' },
    puntarenas: { name: 'Puntarenas', img: '/src/assets/obra_3.webp', short: 'Provincial capital with commercial and industrial projects.' },
  },
}

const SITE_PAGES = {
  es: {
    servicios: ['construccion-general', 'electricidad', 'remodelacion', 'mantenimiento', 'jardineria', 'instalacion', 'fontaneria', 'estructuras-metalicas'],
    zonas: ['jaco', 'garabito', 'quepos', 'parrita', 'puntarenas'],
  },
  en: {},
}
SITE_PAGES.en = { servicios: SITE_PAGES.es.servicios, zonas: SITE_PAGES.es.zonas }

function blogSlugs() {
  const dir = join(CONTENT, 'es', 'blog')
  if (!exists(dir)) return []
  return readdirSync(dir).filter((s) => !s.startsWith('.') && s !== 'index').sort()
}

// ---------- utils ----------
const read = (p) => readFileSync(p, 'utf8')
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'))
const exists = (p) => existsSync(p)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function routeFor(locale, type, slug) {
  const base = locale === 'es' ? '' : '/en'
  if (type === 'blog' && slug === 'index') return base + '/blog'
  return base + '/' + type + '/' + slug
}
function fileFor(locale, type, slug) {
  const dir = locale === 'es' ? '' : 'en/'
  if (type === 'blog' && slug === 'index') return dir + 'blog/index.html'
  return dir + type + '/' + slug + '.html'
}
function absolute(locale, type, slug) {
  return SITE + routeFor(locale, type, slug)
}
function altLocale(locale) {
  return locale === 'es' ? 'en' : 'es'
}
function hreflangLinks(locale, type, slug) {
  const me = absolute(locale, type, slug)
  const alt = absolute(altLocale(locale), type, slug)
  const es = locale === 'es' ? me : alt
  const en = locale === 'en' ? me : alt
  const xDefault = SITE + '/'
  return [
    `<link rel="canonical" href="${me}" />`,
    `<link rel="alternate" hreflang="es" href="${es}" />`,
    `<link rel="alternate" hreflang="en" href="${en}" />`,
    `<link rel="alternate" hreflang="x-default" href="${xDefault}" />`,
  ].join('\n')
}

function ogImageUrl(path, locale) {
  if (!path || path === '/src/assets/hero-industrial.webp') return SITE + '/hero-industrial.webp'
  if (path.startsWith('/src/')) return SITE + '/' + path.replace('/src/', '').split('/').pop()
  if (path.startsWith('/public/')) return SITE + path.replace('/public/', '/')
  return path
}

const ld = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>\n`

// ---------- shared sections ----------
function topbar(locale, texts) {
  const t = texts
  const root = locale === 'es' ? `${SITE}/` : `${SITE}/en/`
  return `<div class="bg-brandNavy text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
<div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
<div class="flex items-center space-x-4">
<span><i class="fa-solid fa-location-dot text-brandOrange mr-1.5"></i> ${t.topLoc}</span>
<span class="hidden md:inline text-slate-600">|</span>
<span class="hidden md:inline"><i class="fa-solid fa-clock text-brandOrange mr-1.5"></i> ${t.topHours}</span>
</div>
<div class="flex items-center space-x-4 ml-auto">
<a class="hover:text-brandOrange transition-colors" href="tel:${FACTS.phoneTel}"><i class="fa-solid fa-phone text-brandOrange mr-1"></i> ${FACTS.phoneDisplay}</a>
<a class="hidden sm:inline hover:text-brandOrange transition-colors" href="mailto:${FACTS.email}"><i class="fa-solid fa-envelope text-brandOrange mr-1"></i> ${FACTS.email}</a>
</div>
</div>
</div>`
}

function navbar(locale, texts) {
  const t = texts.nav
  const base = locale === 'es' ? `${SITE}/` : `${SITE}/en/`
  const switchHref = locale === 'es' ? `${SITE}/en` : `${SITE}/`
  const items = [
    [t.home, base],
    [t.services, base + '#soluciones'],
    [t.projects, SITE + (locale === 'es' ? '' : '/en') + '/#galeria'],
    [t.about, SITE + (locale === 'es' ? '' : '/en') + '/#nosotros'],
    [t.faq, SITE + (locale === 'es' ? '' : '/en') + '/#faq'],
    [t.blog, routeFor(locale, 'blog', 'index')],
  ]
  const desktop = items.map(([label, href], i) =>
    i === 0
      ? `<a class="text-brandOrange transition-colors" href="${href}">${label}</a>`
      : `<a class="hover:text-brandOrange transition-colors" href="${href}">${label}</a>`
  ).join('\n')
  const mobile = items.map(([label, href]) =>
    `<a class="text-lg font-bold text-brandNavy py-2.5 border-b border-slate-100 hover:text-brandOrange transition-colors" href="${href}">${label}</a>`
  ).join('\n')
  return `<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all" id="navbar">
<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
<a class="flex items-center gap-3" data-purpose="site-logo" href="${base}">
<picture>
<source srcset="/src/assets/main-ma-logo-1x.webp 1x, /src/assets/main-ma-logo-2x.webp 2x" type="image/webp"/>
<img alt="MA Soluciones Integrales Logo" class="h-11 md:h-12 w-auto object-contain" src="/src/assets/main-ma-logo.png" width="230" height="98"/>
</picture>
</a>
<div class="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-700">
${desktop}
</div>
<div class="flex items-center space-x-3 sm:space-x-4">
<a class="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold border border-slate-300 text-slate-600 hover:border-brandOrange hover:text-brandOrange transition-colors" href="${switchHref}" rel="alternate" hreflang="${altLocale(locale)}">${texts.switchTitle}</a>
<a class="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-brandOrange text-white shadow-sm hover:bg-brandOrangeHover hover:shadow-md transition-all duration-200 active:scale-95" href="${base}#cotizacion">
  ${t.quote}
</a>
<button aria-label="${texts.switchTitle} menú" class="md:hidden text-slate-700 hover:text-brandOrange p-2 focus:outline-none" id="menuBtn" type="button" aria-expanded="false">
<i class="fa-solid fa-bars-staggered text-xl"></i>
</button>
</div>
</nav>
</header>
<div class="fixed inset-0 bg-black/60 z-40 hidden" id="menuOverlay"></div>
<div class="fixed top-0 right-0 h-full w-80 bg-white z-50 transform translate-x-full transition-transform duration-300 shadow-2xl flex flex-col" id="menuPanel">
<div class="flex justify-end p-4">
<button aria-label="Cerrar menú" class="p-2 text-slate-700 hover:text-brandOrange transition-colors" id="menuClose" type="button">
<i class="fa-solid fa-xmark text-2xl"></i>
</button>
</div>
<nav class="flex flex-col gap-1 px-6 pb-8 overflow-y-auto">
${mobile}
<a class="text-lg font-bold text-brandNavy py-2.5 border-b border-slate-100 hover:text-brandOrange transition-colors" href="${base}#cotizacion">${t.contact}</a>
<div class="flex items-center gap-3 mt-6">
<a class="flex-1 text-center py-3 rounded-full bg-brandOrange text-white font-bold text-sm hover:bg-brandOrangeHover transition-colors" href="${base}#cotizacion">${t.quote}</a>
<a class="flex-1 text-center py-3 rounded-full border border-slate-300 text-slate-600 font-bold text-sm hover:border-brandOrange hover:text-brandOrange transition-colors" href="${switchHref}" rel="alternate" hreflang="${altLocale(locale)}">${texts.switchLabel}</a>
</div>
</nav>
</div>`
}

function footer(locale, texts) {
  const f = texts.footer
  const base = locale === 'es' ? `${SITE}/` : `${SITE}/en/`
  const srvLinks = SITE_PAGES[locale].servicios.map((slug) =>
    `<li><a class="hover:text-brandOrange transition-colors" href="${SITE + routeFor(locale, 'servicios', slug)}">${SERVICE_CATALOG[locale][slug].name}</a></li>`
  ).join('\n')
  const zoneLinks = SITE_PAGES[locale].zonas.map((slug) =>
    `<li><a class="hover:text-brandOrange transition-colors" href="${SITE + routeFor(locale, 'zonas', slug)}">${ZONE_CATALOG[locale][slug].name}</a></li>`
  ).join('\n')
  const blogLinks = blogSlugs().map((slug) => {
    const mp = join(CONTENT, locale, 'blog', slug, 'meta.json')
    const m = exists(mp) ? readJSON(mp) : null
    return m ? `<li><a class="hover:text-brandOrange transition-colors" href="${SITE + routeFor(locale, 'blog', slug)}">${m.cardTitle || m.title}</a></li>` : ''
  }).join('\n')
  const switchHref = locale === 'es' ? `${SITE}/en` : `${SITE}/`
  return `<footer class="bg-brandNavy text-white pt-16 pb-12 overflow-hidden relative" data-purpose="main-footer">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
<div class="md:col-span-4">
<picture>
<source srcset="/src/assets/main-ma-logo-1x.webp 1x, /src/assets/main-ma-logo-2x.webp 2x" type="image/webp"/>
<img alt="MA Soluciones Integrales Logo" class="h-12 w-auto object-contain mb-4 brightness-0 invert" src="/src/assets/main-ma-logo.png" width="230" height="98"/>
</picture>
<p class="text-xs text-slate-300 leading-relaxed max-w-sm">${f.about}</p>
<div class="flex items-center space-x-3 mt-5">
<a aria-label="${esc(f.whatsapp)}" class="w-8 h-8 rounded-full bg-white/10 hover:bg-brandOrange hover:text-white flex items-center justify-center text-slate-300 transition-colors text-xs" href="${FACTS.waPlain}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i></a>
<a aria-label="${esc(f.llamar)}" class="w-8 h-8 rounded-full bg-white/10 hover:bg-brandOrange hover:text-white flex items-center justify-center text-slate-300 transition-colors text-xs" href="tel:${FACTS.phoneTel}"><i class="fa-solid fa-phone"></i></a>
<a aria-label="${esc(f.correo)}" class="w-8 h-8 rounded-full bg-white/10 hover:bg-brandOrange hover:text-white flex items-center justify-center text-slate-300 transition-colors text-xs" href="mailto:${FACTS.email}"><i class="fa-solid fa-envelope"></i></a>
</div>
</div>
<div class="md:col-span-2">
<h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4">${f.secciones}</h3>
<ul class="space-y-2.5 text-xs text-slate-300">
<li><a class="hover:text-brandOrange transition-colors" href="${base}">${f.inicio}</a></li>
<li><a class="hover:text-brandOrange transition-colors" href="${base}#soluciones">${f.servicios}</a></li>
<li><a class="hover:text-brandOrange transition-colors" href="${base}#galeria">${f.proyectos}</a></li>
<li><a class="hover:text-brandOrange transition-colors" href="${base}#nosotros">${f.nosotros}</a></li>
<li><a class="hover:text-brandOrange transition-colors" href="${base}#testimonios">${f.testimonios}</a></li>
</ul>
</div>
<div class="md:col-span-2">
<h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4">${f.soluciones}</h3>
<ul class="space-y-2.5 text-xs text-slate-300">
${srvLinks}
</ul>
</div>
<div class="md:col-span-4">
<div class="grid grid-cols-2 gap-8">
<div>
<h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4">${f.zonas}</h3>
<ul class="space-y-2.5 text-xs text-slate-300">
${zoneLinks}
</ul>
</div>
<div>
<h3 class="text-xs font-bold text-white uppercase tracking-wider mb-4">${f.blog}</h3>
<ul class="space-y-2.5 text-xs text-slate-300">
${blogLinks}
</ul>
</div>
</div>
<h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2 mt-6">${f.ubicacion}</h3>
<div class="rounded-2xl overflow-hidden border border-white/20 relative h-28">
<iframe src="https://www.google.com/maps?q=Jac%C3%B3,+Garabito,+Costa+Rica&output=embed"
width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
title="${esc(f.mapTitle)}"></iframe>
</div>
<p class="text-[11px] text-slate-400 mt-2">${f.mapNote}</p>
</div>
</div>
<div class="relative py-8 select-none pointer-events-none text-center overflow-hidden">
<span class="text-huge-watermark font-black text-white/5 uppercase tracking-wider leading-none block whitespace-nowrap opacity-65">MA SOLUCIONES</span>
</div>
<div class="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
<p>${f.copyright}</p>
<div class="flex items-center space-x-6">
<a class="hover:text-brandOrange transition-colors" href="${switchHref}" rel="alternate" hreflang="${altLocale(locale)}">${f.english}</a>
</div>
</div>
</div>
</footer>`
}

function floats() {
  return `<a href="${FACTS.wa}" target="_blank" rel="noopener noreferrer"
class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
id="whatsappBtn" aria-label="WhatsApp">
<i class="fa-brands fa-whatsapp text-2xl"></i>
</a>
<button class="fixed bottom-24 right-6 z-50 w-12 h-12 bg-brandNavy text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brandOrange transition-all duration-300 opacity-0 translate-y-4 pointer-events-none" id="backToTop" aria-label="Subir">
<i class="fa-solid fa-arrow-up"></i>
</button>`
}

const SCRIPT_COMMON = `<script>
  const menuBtn = document.getElementById('menuBtn');
  const menuPanel = document.getElementById('menuPanel');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  if (menuBtn) {
    function openMenu() { menuPanel.classList.remove('translate-x-full'); menuOverlay.classList.remove('hidden'); document.body.style.overflow = 'hidden'; menuBtn.setAttribute('aria-expanded', 'true'); }
    function closeMenu() { menuPanel.classList.add('translate-x-full'); menuOverlay.classList.add('hidden'); document.body.style.overflow = ''; menuBtn.setAttribute('aria-expanded', 'false'); }
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && !menuOverlay.classList.contains('hidden')) closeMenu(); });
    menuBtn.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
    document.querySelectorAll('#menuPanel a').forEach(a => a.addEventListener('click', closeMenu));
  }
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href.indexOf('#') === 0 && href.length === 1) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 104;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const target = document.getElementById(this.dataset.target);
      const isOpen = target.classList.contains('open');
      document.querySelectorAll('.accordion-content.open').forEach(el => { el.classList.remove('open'); el.previousElementSibling && el.previousElementSibling.classList.remove('open'); });
      if (!isOpen) { target.classList.add('open'); this.classList.add('open'); }
    });
  });
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      const show = window.scrollY > 500;
      backBtn.classList.toggle('opacity-100', show);
      backBtn.classList.toggle('opacity-0', !show);
      backBtn.classList.toggle('translate-y-0', show);
      backBtn.classList.toggle('translate-y-4', !show);
      backBtn.classList.toggle('pointer-events-auto', show);
      backBtn.classList.toggle('pointer-events-none', !show);
    });
    backBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
</script>`

// ---------- schema ----------
function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  }
}

function serviceSchema(meta, locale, url) {
  const areas = ['Jacó', 'Garabito', 'Quepos', 'Parrita', 'Puntarenas', 'Pacífico Central, Costa Rica']
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: SERVICE_CATALOG[locale][meta.slug].name,
    serviceType: SERVICE_CATALOG[locale][meta.slug].name,
    description: meta.description,
    url,
    image: ogImageUrl(meta.ogImage || SERVICE_CATALOG[locale][meta.slug].img, locale),
    areaServed: areas.map((n) => ({ '@type': 'Place', name: n })),
    provider: {
      '@type': 'GeneralContractor',
      name: 'MA Soluciones Integrales',
      url: SITE,
      telephone: FACTS.phoneDisplay,
      email: FACTS.email,
      address: { '@type': 'PostalAddress', addressLocality: 'Jacó', addressRegion: 'Puntarenas', postalCode: '61101', addressCountry: 'CR' },
      founder: [
        { '@type': 'Person', name: 'Robert Matarrita' },
        { '@type': 'Person', name: 'José Matarrita' },
      ],
    },
  }
}

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

function articleSchema(meta, locale, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.h1,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    image: ogImageUrl(meta.ogImage, locale),
    inLanguage: locale === 'es' ? 'es-CR' : 'en-US',
    author: { '@type': 'Person', name: 'Robert Matarrita', jobTitle: 'Fundador & CEO' },
    publisher: { '@type': 'Organization', name: 'MA Soluciones Integrales', logo: { '@type': 'ImageObject', url: SITE + '/assets/main-ma-logo.png' } },
    mainEntityOfPage: url,
  }
}

function blogIndexSchema(locale) {
  const posts = blogSlugs().map((slug) => {
    const m = readJSON(join(CONTENT, locale, 'blog', slug, 'meta.json'))
    return {
      '@type': 'BlogPosting',
      headline: m.h1,
      description: m.description,
      datePublished: m.date,
      image: ogImageUrl(m.ogImage, locale),
      url: SITE + routeFor(locale, 'blog', slug),
      author: { '@type': 'Person', name: 'Robert Matarrita' },
    }
  })
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: locale === 'es' ? 'Blog MA Soluciones Integrales' : 'MA Soluciones Integrales Blog',
    url: SITE + routeFor(locale, 'blog', 'index'),
    blogPost: posts,
  }
}

function zonasItemListSchema(meta, locale, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.title || '',
    itemListElement: (meta.servicesOffered || []).map((slug, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: SITE + routeFor(locale, 'servicios', slug),
      name: SERVICE_CATALOG[locale][slug].name,
    })),
  }
}

// ---------- blocks ----------
function breadcrumbBand(locale, texts, items) {
  const links = items.map((it, i) => {
    if (i === items.length - 1) return `<span class="text-white/70 hover:text-white transition-colors">${it.name}</span>`
    return `<a class="text-white/70 hover:text-white transition-colors" href="${it.url}">${it.name}</a>`
  }).join('<i class="fa-solid fa-chevron-right text-[9px] text-white/40 mx-2"></i>')
  return `<div class="flex items-center flex-wrap text-[11px] font-semibold uppercase tracking-wide">
${links}
</div>`
}

function pageHeader(locale, meta, kind) {
  const sv = SERVICE_CATALOG[locale][meta.slug]
  if (kind === 'service') {
    return `<div class="relative overflow-hidden bg-brandNavy">
${meta.heroAlt ? `<img class="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" src="${sv.img}" alt="${esc(meta.heroAlt)}" loading="eager" decoding="async" width="1600" height="560"/>` : `<img class="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" src="${sv.img}" alt="${esc(meta.h1)}" loading="eager" decoding="async" width="1600" height="560"/>`}
<div class="absolute inset-0 bg-gradient-to-t from-brandNavy via-brandNavy/80 to-brandNavy/60"></div>
<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
${breadcrumbBand(locale, L[locale], meta._crumbs)}
<div class="mt-6 flex items-start gap-4">
<span class="w-12 h-12 rounded-2xl bg-brandOrange flex items-center justify-center text-white text-xl flex-shrink-0"><i class="fa-solid ${sv.icon}"></i></span>
<div>
<span class="text-xs uppercase font-bold tracking-widest text-brandOrange">${esc(meta.tagline || sv.tag)}</span>
<h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mt-1">${esc(meta.h1)}</h1>
</div>
</div>
<p class="mt-5 max-w-3xl text-base sm:text-lg text-slate-300 leading-relaxed">${esc(meta.lead)}</p>
<div class="mt-7 flex flex-wrap items-center gap-4">
<a class="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-bold bg-brandOrange text-white hover:bg-brandOrangeHover shadow-lg hover:shadow-orange-500/30 transition-all" href="${FACTS.wa}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp mr-2"></i> ${L[locale].cta.wa}</a>
<a class="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold bg-white text-brandNavy hover:bg-slate-100 shadow-md transition-all" href="${locale === 'es' ? `${SITE}/#cotizacion` : `${SITE}/en/#cotizacion`}">${L[locale].cta.quote} <i class="fa-solid fa-arrow-right ml-2 text-xs"></i></a>
</div>
</div>
</div>`
  }
  // zona / article header share the same navy band
  return `<div class="relative overflow-hidden bg-brandNavy">
<img class="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" src="${meta.ogImage}" alt="${esc(meta.h1)}" loading="eager" decoding="async" width="1600" height="560"/>
<div class="absolute inset-0 bg-gradient-to-t from-brandNavy via-brandNavy/80 to-brandNavy/60"></div>
<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
${breadcrumbBand(locale, L[locale], meta._crumbs)}
<span class="mt-6 block text-xs uppercase font-bold tracking-widest text-brandOrange">${esc(meta.kicker || '')}</span>
<h1 class="mt-1 max-w-3xl text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">${esc(meta.h1)}</h1>
<p class="mt-5 max-w-3xl text-base sm:text-lg text-slate-300 leading-relaxed">${esc(meta.lead)}</p>
<div class="mt-7 flex flex-wrap items-center gap-4">
<a class="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-bold bg-brandOrange text-white hover:bg-brandOrangeHover shadow-lg hover:shadow-orange-500/30 transition-all" href="${FACTS.wa}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp mr-2"></i> ${L[locale].cta.wa}</a>
<a class="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold bg-white text-brandNavy hover:bg-slate-100 shadow-md transition-all" href="${locale === 'es' ? `${SITE}/#cotizacion` : `${SITE}/en/#cotizacion`}">${L[locale].cta.quote} <i class="fa-solid fa-arrow-right ml-2 text-xs"></i></a>
</div>
</div>
</div>`
}

function ctaBand(locale) {
  const t = L[locale].cta
  const root = locale === 'es' ? `${SITE}/#cotizacion` : `${SITE}/en/#cotizacion`
  return `<section class="py-14 bg-white">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="bg-brandNavy rounded-3xl relative overflow-hidden shadow-2xl">
<img class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" src="/src/assets/obra_3.webp" alt="" loading="lazy" decoding="async" width="1600" height="400"/>
<div class="absolute inset-0 bg-gradient-to-t from-brandNavy via-brandNavy/85 to-brandNavy/70"></div>
<div class="relative z-10 px-6 py-12 sm:px-12 md:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
<div class="max-w-2xl text-center lg:text-left">
<span class="text-xs uppercase font-bold tracking-widest text-brandOrange">${esc(t.kicker)}</span>
<h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">${esc(t.title)}</h2>
<p class="text-sm text-slate-300 mt-3">${esc(t.text)}</p>
</div>
<div class="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
<a class="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-bold bg-brandOrange text-white hover:bg-brandOrangeHover shadow-lg transition-all" href="${FACTS.wa}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp mr-2"></i> ${esc(t.wa)}</a>
<a class="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold bg-white text-brandNavy hover:bg-slate-100 shadow-md transition-all" href="${root}">${esc(t.quote)} <i class="fa-solid fa-arrow-right ml-2 text-xs"></i></a>
</div>
</div>
</div>
</div>
</section>`
}

function relatedServicesBlock(locale, slugList) {
  const t = L[locale]
  const cards = slugList.map((slug) => {
    const s = SERVICE_CATALOG[locale][slug]
    return `<a class="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-xl hover:border-brandOrange/40 transition-all group" href="${SITE + routeFor(locale, 'servicios', slug)}">
<div>
<span class="w-11 h-11 rounded-xl bg-brandOrange/10 text-brandOrange flex items-center justify-center text-lg mb-4"><i class="fa-solid ${s.icon}"></i></span>
<h3 class="text-base font-bold text-brandNavy group-hover:text-brandOrange transition-colors">${esc(s.name)}</h3>
<p class="text-xs font-semibold text-slate-400 mt-1">${esc(s.tag)}</p>
</div>
<div class="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
<span class="text-xs font-semibold text-slate-400">${esc(t.readArticle)}</span>
<i class="fa-solid fa-arrow-right text-xs text-brandOrange"></i>
</div>
</a>`
  }).join('\n')
  return `<section class="py-12 bg-slate-50">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="mb-8">
<span class="text-xs uppercase font-bold tracking-wider text-brandOrange">${esc(t.relatedLabel)}</span>
<h2 class="text-2xl sm:text-3xl font-extrabold text-brandNavy tracking-tight mt-1">${esc(t.relatedLabel)}</h2>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
${cards}
</div>
</div>
</section>`
}

function zonesNavBlock(locale, active) {
  const t = L[locale]
  const chips = SITE_PAGES[locale].zonas.map((slug) =>
    slug === active
      ? `<a class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brandOrange text-white text-sm font-bold" href="${SITE + routeFor(locale, 'zonas', slug)}"><i class="fa-solid fa-location-dot text-xs"></i> ${ZONE_CATALOG[locale][slug].name}</a>`
      : `<a class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 text-slate-600 hover:border-brandOrange hover:text-brandOrange text-sm font-semibold" href="${SITE + routeFor(locale, 'zonas', slug)}"><i class="fa-solid fa-location-dot text-xs text-brandOrange"></i> ${ZONE_CATALOG[locale][slug].name}</a>`
  ).join('\n')
  return `<section class="py-12 bg-white border-y border-slate-100">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="flex flex-wrap items-center justify-between gap-6">
<div>
<span class="text-xs uppercase font-bold tracking-wider text-brandOrange">${esc(t.zonesLabel)}</span>
<h2 class="text-xl sm:text-2xl font-extrabold text-brandNavy tracking-tight mt-1">${esc(t.zonesNote)}</h2>
</div>
<div class="flex flex-wrap gap-3">
${chips}
</div>
</div>
</div>
</section>`
}

function servicesStrip(locale, slugList) {
  const t = L[locale]
  const items = slugList.map((slug) => {
    const s = SERVICE_CATALOG[locale][slug]
    return `<a class="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 hover:border-brandOrange/50 hover:shadow-md transition-all" href="${SITE + routeFor(locale, 'servicios', slug)}">
<span class="w-10 h-10 rounded-xl bg-brandOrange/10 text-brandOrange flex items-center justify-center text-base flex-shrink-0"><i class="fa-solid ${s.icon}"></i></span>
<div>
<h3 class="text-sm font-bold text-brandNavy">${esc(s.name)}</h3>
<p class="text-[11px] text-slate-400">${esc(s.tag)}</p>
</div>
</a>`
  }).join('\n')
  return `<section class="py-12 bg-white">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="mb-8">
<span class="text-xs uppercase font-bold tracking-wider text-brandOrange">${esc(t.servicesLabel)}</span>
<h2 class="text-2xl sm:text-3xl font-extrabold text-brandNavy tracking-tight mt-1">${esc(t.servicesLabel)}</h2>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
${items}
</div>
</div>
</section>`
}

function faqBlock(locale, faqs) {
  const t = L[locale]
  const items = faqs.map((f, i) => `<div class="border border-slate-200 bg-white rounded-2xl overflow-hidden">
<button class="w-full flex justify-between items-center p-5 text-left font-bold text-brandNavy accordion-btn hover:bg-brandMutedBg transition-colors" data-target="faq-k-${i}">
<span class="text-sm sm:text-base">${esc(f.q)}</span>
<i class="fa-solid fa-chevron-down accordion-icon text-brandOrange text-xs"></i>
</button>
<div class="accordion-content" id="faq-k-${i}"><div class="px-5 pb-5 text-xs text-slate-500 leading-relaxed">${f.a}</div></div>
</div>`).join('\n')
  return `<section class="py-16 bg-slate-50">
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="text-center mb-12">
<span class="text-xs uppercase font-bold tracking-wider text-brandOrange">${esc(t.faqLabel)}</span>
<h2 class="text-2xl sm:text-4xl font-extrabold text-brandNavy tracking-tight mt-1">${esc(t.faqLabel)}</h2>
</div>
<div class="space-y-3">
${items}
</div>
</div>
</section>`
}

// ---------- page assemblers ----------
function head(locale, meta, url, kind, alternate) {
  const text = L[locale]
  const og = meta.ogImage || (kind === 'service' ? SERVICE_CATALOG[locale][meta.slug].img : '/src/assets/hero-industrial.webp')
  const ogUrl = ogImageUrl(og, locale)
return `<!DOCTYPE html>
 <html class="scroll-smooth" lang="${locale}">
 <head>
 <meta charset="utf-8"/>
 <meta http-equiv="Content-Security-Policy" content="${CSP}"/>
 <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}" />
<meta name="author" content="MA Soluciones Integrales" />
<meta name="theme-color" content="#0a1d37" />
<meta name="format-detection" content="telephone=yes" />
<script>document.documentElement.classList.add('js');</script>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-54LXDZ4P');</script>
<!-- End Google Tag Manager -->
${hreflangLinks(locale, alternate.type, alternate.slug)}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="dns-prefetch" href="https://formspree.io" />
<link rel="dns-prefetch" href="https://maps.googleapis.com" />
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(meta.ogTitle || meta.title)}" />
<meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:image" content="${ogUrl}" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="${text.ogLocale}" />
<meta property="og:locale:alternate" content="${text.ogAlt}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(meta.ogTitle || meta.title)}" />
<meta name="twitter:description" content="${esc(meta.description)}" />
<meta name="twitter:image" content="${ogUrl}" />
<link rel="icon" type="image/svg+xml" href="/src/assets/ma-favicon.svg" />
<style data-purpose="typography">
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1e293b;
      background-color: #fdfdfd;
      overflow-x: hidden;
    }
    .text-huge-watermark {
      font-size: clamp(3.5rem, 12vw, 11rem);
      line-height: 0.85;
      letter-spacing: -0.04em;
    }
    @font-face {
      font-family: 'Font Awesome 6 Free';
      font-style: normal;
      font-weight: 900;
      font-display: swap;
      src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Font Awesome 6 Brands';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2') format('woff2');
    }
  </style>
<style data-purpose="custom-effects">
    .warm-radial-gradient {
      background: radial-gradient(circle at 50% 50%, rgba(254, 237, 222, 0.7) 0%, rgba(255, 255, 255, 0.2) 75%);
    }
    html { scroll-padding-top: 96px; }
    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.45s cubic-bezier(0.22,1,0.36,1);
    }
    .accordion-content.open { max-height: 420px; }
    .accordion-btn .accordion-icon { transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); }
    .accordion-btn.open .accordion-icon { transform: rotate(180deg); }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
    }
  </style>
<link rel="stylesheet" href="/src/style.css">
</head>
<body class="antialiased selection:bg-brandOrange selection:text-white">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-54LXDZ4P"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`
}

function buildServicePage(locale, slug) {
  const dir = join(CONTENT, locale, 'servicios', slug)
  if (!exists(dir)) return null
  const meta = readJSON(join(dir, 'meta.json'))
  meta.slug = slug
  const fragment = read(join(dir, 'fragment.html'))
  const url = absolute(locale, 'servicios', slug)
  const text = L[locale]
  const base = locale === 'es' ? `${SITE}/` : `${SITE}/en/`
  meta._crumbs = [
    { name: text.crumbHome, url: base },
    { name: SERVICE_CATALOG[locale][slug].name, url },
  ]
  const schemaNodes = [
    serviceSchema(meta, locale, url),
    breadcrumbSchema(meta._crumbs.map((c) => ({ name: c.name, url: c.url }))),
    faqSchema(meta.faqs || []),
  ]
  let zonesHtml = ''
  if (meta.zone) {
    zonesHtml = zonesNavBlock(locale, meta.zone)
  } else {
    zonesHtml = zonesNavBlock(locale, null)
  }
  const related = (meta.relatedServices || []).filter((s) => s !== slug).slice(0, 3)
  const bodyMain = `<main>
${pageHeader(locale, meta, 'service')}
<section class="py-14 bg-white">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="max-w-3xl mx-auto lg:mx-0 lg:max-w-4xl">
${fragment}
</div>
</div>
</section>
${related.length ? relatedServicesBlock(locale, related) : ''}
${zonesHtml}
${faqBlock(locale, meta.faqs || [])}
${ctaBand(locale)}
</main>`
  return assemble(locale, meta, url, schemaNodes, bodyMain, { type: 'servicios', slug })
}

function buildZonaPage(locale, slug) {
  const dir = join(CONTENT, locale, 'zonas', slug)
  if (!exists(dir)) return null
  const meta = readJSON(join(dir, 'meta.json'))
  meta.slug = slug
  const fragment = read(join(dir, 'fragment.html'))
  const url = absolute(locale, 'zonas', slug)
  const text = L[locale]
  const base = locale === 'es' ? `${SITE}/` : `${SITE}/en/`
  meta._crumbs = [
    { name: text.crumbHome, url: base },
    { name: ZONE_CATALOG[locale][slug].name, url },
  ]
  const schemaNodes = [
    breadcrumbSchema(meta._crumbs.map((c) => ({ name: c.name, url: c.url }))),
    zonasItemListSchema(meta, locale, url),
  ]
  const bodyMain = `<main>
${pageHeader(locale, meta, 'zona')}
<section class="py-14 bg-white">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="max-w-3xl mx-auto lg:mx-0 lg:max-w-4xl">
${fragment}
</div>
</div>
</section>
${servicesStrip(locale, meta.servicesOffered || [])}
${zonesNavBlock(locale, slug)}
${ctaBand(locale)}
</main>`
  return assemble(locale, meta, url, schemaNodes, bodyMain, { type: 'zonas', slug })
}

function buildArticlePage(locale, slug) {
  const dir = join(CONTENT, locale, 'blog', slug)
  if (!exists(dir)) return null
  const meta = readJSON(join(dir, 'meta.json'))
  meta.slug = slug
  const fragment = read(join(dir, 'fragment.html'))
  const url = absolute(locale, 'blog', slug)
  const text = L[locale]
  const base = locale === 'es' ? `${SITE}/` : `${SITE}/en/`
  meta._crumbs = [
    { name: text.crumbHome, url: base },
    { name: text.crumbBlog, url: SITE + routeFor(locale, 'blog', 'index') },
    { name: meta.h1, url },
  ]
  const schemaNodes = [
    articleSchema(meta, locale, url),
    breadcrumbSchema(meta._crumbs.map((c) => ({ name: c.name, url: c.url }))),
  ]
  const others = blogSlugs().filter((s) => s !== slug)
  const otherCards = others.map((s) => {
    const m = readJSON(join(CONTENT, locale, 'blog', s, 'meta.json'))
    return `<a class="bg-slate-50 border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow rounded-3xl group" href="${SITE + routeFor(locale, 'blog', s)}">
<img alt="${esc(m.alt || m.h1)}" class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" src="${m.cardImg}" loading="lazy" decoding="async" width="400" height="250"/>
<div class="p-5">
<span class="text-brandOrange text-[11px] font-bold uppercase tracking-wider">${esc(m.dateLabel)}</span>
<h3 class="text-base font-bold text-brandNavy mt-1 leading-snug">${esc(m.cardTitle || m.h1)}</h3>
</div>
</a>`
  }).join('\n')
  const bodyMain = `<main>
${pageHeader(locale, meta, 'article')}
<article class="py-14 bg-white">
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="flex items-center gap-3 text-xs text-slate-400 mb-6">
<span class="inline-flex items-center gap-1.5"><i class="fa-solid fa-calendar-days text-brandOrange"></i> ${esc(meta.dateLabel)}</span>
<span>·</span>
<span class="inline-flex items-center gap-1.5"><i class="fa-solid fa-user-pen text-brandOrange"></i> Robert Matarrita</span>
</div>
${fragment}
</div>
</article>
${otherCards.length ? `<section class="py-12 bg-slate-50">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="mb-8">
<span class="text-xs uppercase font-bold tracking-wider text-brandOrange">${esc(text.crumbBlog)}</span>
<h2 class="text-2xl sm:text-3xl font-extrabold text-brandNavy tracking-tight mt-1">${esc(text.moreBlog)}</h2>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
${otherCards}
</div>
</div>
</section>` : ''}
${ctaBand(locale)}
</main>`
  return assemble(locale, meta, url, schemaNodes, bodyMain, { type: 'blog', slug })
}

function buildBlogIndex(locale) {
  const url = absolute(locale, 'blog', 'index')
  const text = L[locale]
  const base = locale === 'es' ? `${SITE}/` : `${SITE}/en/`
  const meta = {
    title: locale === 'es' ? 'Blog de Construcción y Remodelación | MA Soluciones' : 'Construction & Remodeling Blog – Pacific Costa Rica | MA Soluciones',
    ogTitle: locale === 'es' ? 'Blog — MA Soluciones Integrales' : 'Blog — MA Soluciones Integrales',
    description: locale === 'es'
      ? 'Consejos y novedades sobre construcción, electricidad, mantenimiento y remodelación en el Pacífico Central de Costa Rica.'
      : 'Tips and news about construction, electrical, maintenance and remodeling on the Central Pacific coast of Costa Rica.',
    h1: locale === 'es' ? 'Consejos & Novedades' : 'Tips & News',
    kicker: locale === 'es' ? 'Blog' : 'Blog',
    lead: locale === 'es'
      ? 'Información útil para su próximo proyecto de construcción o remodelación en Jacó y todo el Pacífico Central.'
      : 'Useful information for your next construction or remodeling project in Jacó and the Central Pacific.',
    ogImage: '/src/assets/obra_1.webp',
    _crumbs: [
      { name: text.crumbHome, url: base },
      { name: text.crumbBlog, url },
    ],
  }
  const cards = blogSlugs().map((slug, i) => {
    const m = readJSON(join(CONTENT, locale, 'blog', slug, 'meta.json'))
    return `<a class="bg-slate-50 border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow rounded-3xl group" href="${SITE + routeFor(locale, 'blog', slug)}">
<img alt="${esc(m.alt || m.h1)}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" src="${m.cardImg}" loading="lazy" decoding="async" width="400" height="250"/>
<div class="p-6">
<span class="text-brandOrange text-xs font-bold uppercase tracking-wider">${esc(m.dateLabel)}</span>
<h2 class="text-lg font-bold text-brandNavy group-hover:text-brandOrange transition-colors mt-2 mb-2">${esc(m.cardTitle || m.h1)}</h2>
<p class="text-sm text-slate-500 leading-relaxed">${esc(m.excerpt)}</p>
</div>
</a>`
  }).join('\n')
  const schemaNodes = [
    blogIndexSchema(locale),
    breadcrumbSchema(meta._crumbs.map((c) => ({ name: c.name, url: c.url }))),
  ]
  const bodyMain = `<main>
${pageHeader(locale, meta, 'index')}
<section class="py-16 bg-white">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
${cards}
</div>
</div>
</section>
${ctaBand(locale)}
</main>`
  return assemble(locale, meta, url, schemaNodes, bodyMain, { type: 'blog', slug: 'index' })
}

function assemble(locale, meta, url, schemaNodes, bodyMain, alternate) {
  const text = L[locale]
  let schemaHtml = schemaNodes.map(ld).join('')
  return `${head(locale, meta, url, meta.type, alternate)}
${schemaHtml}
${topbar(locale, text)}
${navbar(locale, text)}
${bodyMain}
${footer(locale, text)}
${floats()}
${SCRIPT_COMMON}
</body>
</html>`
}

// ---------- sitemap ----------
function buildSitemap() {
  const urls = []
  urls.push({ loc: `${SITE}/`, lastmod: LASTMOD, priority: '1.0', freq: 'monthly' })
  urls.push({ loc: `${SITE}/en/`, lastmod: LASTMOD, priority: '0.9', freq: 'monthly' })
  const add = (locale, type, slug, priority) => urls.push({ loc: absolute(locale, type, slug), lastmod: LASTMOD, priority, freq: 'monthly' })
  for (const slug of SITE_PAGES.es.servicios) { add('es', 'servicios', slug, '0.9'); add('en', 'servicios', slug, '0.8') }
  for (const slug of SITE_PAGES.es.zonas) { add('es', 'zonas', slug, '0.8'); add('en', 'zonas', slug, '0.7') }
  add('es', 'blog', 'index', '0.7'); add('en', 'blog', 'index', '0.6')
  for (const slug of blogSlugs()) { add('es', 'blog', slug, '0.6'); add('en', 'blog', slug, '0.5') }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
  writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf8')
  return urls.length
}

// ---------- main ----------
const built = []
const locales = ['es', 'en']
const types = ['servicios', 'zonas', 'blog']

for (const locale of locales) {
  for (const type of types) {
    const baseDir = join(CONTENT, locale, type)
    if (!exists(baseDir)) continue
    if (type === 'blog') {
      const html = buildBlogIndex(locale)
      if (html) {
        const outPath = join(ROOT, fileFor(locale, 'blog', 'index'))
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html, 'utf8')
        built.push((locale === 'es' ? '' : '/en') + '/blog')
      }
    }
    for (const slug of readdirSync(baseDir)) {
      if (slug.startsWith('.') || slug === 'index') continue
      const outPath = join(ROOT, fileFor(locale, type, slug))
      let html = null
      if (type === 'servicios') html = buildServicePage(locale, slug)
      else if (type === 'zonas') html = buildZonaPage(locale, slug)
      else html = buildArticlePage(locale, slug)
      if (html) {
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html, 'utf8')
        built.push((locale === 'es' ? '' : '/en') + '/' + type + '/' + slug)
      }
    }
  }
}

// Solo assets referenciados vía meta.json / catálogos (og:image, schema image)
function ensurePublicAssets() {
  const need = new Set(['/src/assets/hero-industrial.webp'])
  const pushMetaImages = (loc, type) => {
    const baseDir = join(CONTENT, loc, type)
    if (!exists(baseDir)) return
    for (const slug of readdirSync(baseDir)) {
      if (slug.startsWith('.')) continue
      const mp = join(baseDir, slug, 'meta.json')
      if (!exists(mp)) continue
      const m = readJSON(mp)
      if (m.ogImage) need.add(m.ogImage)
      if (m.cardImg) need.add(m.cardImg)
    }
  }
  for (const loc of locales) {
    for (const slug in SERVICE_CATALOG[loc]) need.add(SERVICE_CATALOG[loc][slug].img)
    for (const slug in ZONE_CATALOG[loc]) need.add(ZONE_CATALOG[loc][slug].img)
    for (const type of ['servicios', 'zonas', 'blog']) pushMetaImages(loc, type)
  }
  for (const p of need) {
    if (!p || !p.startsWith('/src/')) continue
    const rel = p.replace('/src/', '')
    const base = rel.split('/').pop()
    try { copyFileSync(join(ROOT, 'src', rel), join(ROOT, 'public', base)) } catch {}
  }
}
ensurePublicAssets()

const total = buildSitemap()
console.log(`[build-site] ${built.length} páginas generadas (${total} URLs en sitemap)`)
built.sort().forEach((r) => console.log('  → /' + r.replace(/^\//, '')))