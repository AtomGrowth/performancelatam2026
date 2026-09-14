# ATOM_WhatsAppPerformance

Página del estudio "Performance en WhatsApp" de Atom. Nace como duplicado de
`ATOM_Academy` y hereda su design system (tokens `--aa-*`, Grift / Inter Tight / Interval,
motion OSMO). La lógica y los estilos se sirven por un loader; el host solo aporta un punto
de montaje.

Build: esbuild + TypeScript + GSAP.

## Uso en el host

```html
<div data-aa-mount data-aa-theme="light" data-aa-lang="es"></div>
<!-- loader: pendiente F4 (Vercel) -->
```

## Desarrollo

```bash
npm run typecheck   # tsc --noEmit
npm run build       # genera dist/
npm run dev         # build + watch + server en :8766 (sirve preview.html)
```

Ver `CLAUDE.md` para arquitectura, fases y reglas.
