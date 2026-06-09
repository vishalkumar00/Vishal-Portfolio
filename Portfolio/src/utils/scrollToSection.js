// Anchor navigation aware of the scroll-driven sections.
//
// Skills and Projects are tall scroll tracks (height >> 100vh) whose content
// assembles as you scroll into them — landing at the section top shows an
// empty stage. ENTRY maps each anchor to the in-track progress where the
// content is fully assembled, so direct navigation lands on the finished view.
const ENTRY = {
  '#skills': 0.85, // circle assembled + headline in (sp ≥ 0.82)
  '#projects': 0.2, // first card fully slid in (p 0.15–0.28)
}

export function scrollToSection(href) {
  const el = document.querySelector(href)
  if (!el) return
  // compact layouts render these sections static, so no offset is needed
  const compact = window.matchMedia('(max-width: 820px)').matches
  const track = Math.max(0, el.offsetHeight - window.innerHeight)
  const top = el.offsetTop + (compact ? 0 : track * (ENTRY[href] ?? 0))
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
  history.pushState(null, '', href)
}
