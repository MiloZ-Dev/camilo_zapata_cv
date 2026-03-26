import { loadCV, applyCV, getLang } from './i18n'

async function init() {
  const lang = (localStorage.getItem('lang') ?? 'es') as 'es' | 'en'
  if (lang === 'en') {
    const data = await loadCV('en')
    applyCV(data)
  }
}

window.addEventListener('lang-change', async (e: Event) => {
  const { lang } = (e as CustomEvent).detail
  const data = await loadCV(lang)
  applyCV(data)
})

init()