export type Lang = 'es' | 'en'

let cvCache: Record<string, unknown> | null = null
let currentLang: Lang = (localStorage.getItem('lang') as Lang) ?? 'es'

export function getLang(): Lang {
  return currentLang
}

export async function loadCV(lang: Lang): Promise<Record<string, unknown>> {
  const url = lang === 'es' ? '/cv.json' : '/cv_en.json'
  const res = await fetch(url)
  const data = await res.json()
  cvCache = data
  currentLang = lang
  return data
}

export function applyCV(data: Record<string, unknown>) {
  const els = document.querySelectorAll<HTMLElement>('[data-i18n]')
  const basics = data.basics as Record<string, unknown>
  const work = data.work as Array<Record<string, unknown>>
  const education = data.education as Array<Record<string, unknown>>
  const projects = data.projects as Array<Record<string, unknown>>

  els.forEach(el => {
    const key = el.dataset.i18n!

    // basics
    if (key === 'basics.name')    el.textContent = basics.name as string
    if (key === 'basics.label')   el.textContent = basics.label as string
    if (key === 'basics.summary') el.textContent = basics.summary as string
    if (key === 'basics.city') {
      const loc = basics.location as Record<string, string>
      el.textContent = `${loc.city}, ${loc.region}`
    }

    // experience
    if (key.startsWith('work.')) {
      const [, idxStr, field] = key.split('.')
      const idx = parseInt(idxStr)
      const job = work[idx]
      if (!job) return
      if (field === 'position') el.textContent = job.position as string
      if (field === 'summary')  el.textContent = job.summary as string
      if (field === 'endYear') {
        el.textContent = job.endDate
          ? new Date(job.endDate as string).getFullYear().toString()
          : (document.documentElement.lang === 'en' ? 'Present' : 'Actual')
      }
    }

    // education
    if (key.startsWith('edu.')) {
      const [, idxStr, field] = key.split('.')
      const idx = parseInt(idxStr)
      const item = education[idx]
      if (!item) return
      if (field === 'area') el.textContent = item.area as string
    }

    // projects
    if (key.startsWith('project.')) {
      const [, idxStr, field] = key.split('.')
      const idx = parseInt(idxStr)
      const p = projects[idx]
      if (!p) return
      if (field === 'description') el.textContent = p.description as string
    }
  })

  // Section titles
  const sectionTitles: Record<string, Record<Lang, string>> = {
    'about':      { es: 'Sobre mí',          en: 'About me' },
    'experience': { es: 'Experiencia laboral', en: 'Work Experience' },
    'education':  { es: 'Educación',          en: 'Education' },
    'projects':   { es: 'Proyectos',          en: 'Projects' },
    'skills':     { es: 'Habilidades',        en: 'Skills' },
  }
  const lang = currentLang
  document.querySelectorAll<HTMLElement>('[data-section]').forEach(el => {
    const key = el.dataset.section!
    if (sectionTitles[key]) el.textContent = sectionTitles[key][lang]
  })

  // Badge "Actual" / "Present"
  document.querySelectorAll<HTMLElement>('.badge-current').forEach(el => {
    el.textContent = lang === 'en' ? 'Present' : 'Actual'
  })

  // Keyboard manager footer
  const footer = document.querySelector<HTMLElement>('#normal-footer')
  if (footer) {
    footer.innerHTML = lang === 'en'
      ? 'Press <kbd>Cmd</kbd> + <kbd>K</kbd> to open the command palette.'
      : 'Pulsa <kbd>Cmd</kbd> + <kbd>K</kbd> para abrir la paleta de comandos.'
  }

  // Re-aplicar clase advanced según idioma
  document.querySelectorAll<HTMLElement>('[data-skill-level]').forEach(el => {
    const level = el.dataset.skillLevel!
    const isAdvanced = lang === 'en' ? level === 'Advanced' : level === 'Avanzado'
    el.classList.toggle('advanced', isAdvanced)
  })
  document.documentElement.lang = lang
}