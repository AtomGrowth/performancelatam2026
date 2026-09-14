// Entry point. Cada punto de montaje declara su configuración por atributos:
//   <div data-aa-mount
//        data-aa-theme="light|dark"
//        data-aa-lang="es|en"></div>
// El loader (servido desde Vercel) inyecta este bundle; ver CLAUDE.md.

import { type Theme, type Lang } from './core/types';
import { initMotion } from './ui/motion';
import { initAccordion } from './ui/accordion';
import { initRotatingText } from './ui/rotating-text';
import { initCountUp } from './ui/stat';
import { initLatamMap } from './ui/latam-map';
import { renderBackground } from './ui/background';
import { initMetaTheme } from './ui/meta-theme';
import { renderHero } from './sections/hero';
import { renderMarqueeBand, initMarqueeBand } from './sections/marquee-band';
import { initLetterRipple } from './ui/letter-ripple';
import { renderContentSections } from './sections/content-sections';

// Scroll suave para anclas internas (#id) con scroll nativo.
function initAnchorScroll(root: HTMLElement): void {
  root.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')?.slice(1);
    if (!id) return;
    const target = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function resolveTheme(raw: string | undefined): Theme {
  return raw === 'dark' ? 'dark' : 'light';
}

function resolveLang(raw: string | undefined): Lang {
  return raw === 'en' ? 'en' : 'es';
}

function boot(): void {
  const mounts = document.querySelectorAll<HTMLElement>('[data-aa-mount]');
  mounts.forEach((mount) => {
    const theme = resolveTheme(mount.dataset.aaTheme);
    const lang = resolveLang(mount.dataset.aaLang);

    // Root wrapper — todo el CSS está scopeado a .aa-landing
    const root = document.createElement('div');
    root.className = 'aa-landing';
    root.setAttribute('data-aa-theme', theme);
    root.setAttribute('data-aa-lang', lang);

    renderBackground(root); // bg fijo texturizado detrás de todo
    renderHero(root);
    renderMarqueeBand(root);
    renderContentSections(root);

    mount.replaceChildren(root);
    initAnchorScroll(root);
    initAccordion(root);
    initRotatingText(root);
    initMetaTheme();
    initCountUp(root);
    initLatamMap(root);
    initLetterRipple(root);
    initMarqueeBand(root);
    initMotion(root); // al final: su ScrollTrigger.refresh() recoloca también los conteos
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
