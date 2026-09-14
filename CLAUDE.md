# ATOM_WhatsAppPerformance

Página del estudio "Performance en WhatsApp" (PDF `Atom_Performance_WhatsApp_2026_FINAL_CORREGIDO_v3`).
Duplicado de `ATOM_Academy`: mismo design system, mismo patrón mount + loader.
Build: esbuild + TypeScript + GSAP. Design language: OSMO.

## Identidad

| Campo | Valor |
|---|---|
| Origen | `~/Desktop/SoftwareDevProjects/ATOM_Academy` (repo `karenrebecag/Academy_LP`) |
| Repo | `AtomGrowth/performancelatam2026` (público), rama `main` |
| Distribución | loader en Vercel (patrón de `atom-mountpoint-pages`): `/loader.js` inyecta `dist/landing.{css,js}`; CORS y cache 300 s en `vercel.json`. Assets sin hash por ahora |
| Bundle | `dist/landing.js` + `dist/landing.css` |

## Decisiones

- Acento: verde Academy (`--aa-color-electric` #25d366). El naranja del PDF no entra.
- CTA: form gated para descargar el PDF → `/api/download` (Edge) → Apps Script → Sheet propia
  (no la de la waitlist de Academy). El PDF vive en R2 con key no adivinable (gate blando).
- Prefijo CSS `aa-` y mount `data-aa-mount` se conservan.

## Fases

| Fase | Alcance | Estado |
|---|---|---|
| F0 | Duplicar + limpiar widgets de Academy, build verde | hecha |
| F1 | `data/study.ts` + `data/format.ts` + `ui/stat.ts` + kind `stats` (row/aside/cards) + figure en statement | hecha |
| F2 | `bars` (países, industrias) + `funnel` en variante `split` (Relume Stats 24) | pendiente |
| F3 | `table` (Relume Table 5) + `quartiles` (Relume Layout 637) | pendiente |
| F4 | form gated + `/api/download` + `vercel.json` + loader | form maquetado en Medir → mejorar (`sections/download-form.ts`, sin conectar); falta endpoint |
| F5 | copy completo + responsive | pendiente |

Pendiente de confirmar en el PDF: "ha cambiado" con fecha futura (1 oct 2026), "14 países" vs
exclusión de EE. UU./RD, "cercanas al 25 %" vs cuartil alto 22,0 %, "Con venta 0,81 %" sin texto.

## Layouts: DS primero, Relume para los huecos

Se conservan prose, statement, info, faq, checklist, cta y hero del DS. Relume (conector MCP)
aporta solo estructura, reescrita en TS vanilla con tokens `--aa-*` (su código es React +
Tailwind, no se vendoriza): Stats 2 (row), Stats 14 (aside), Stats 44 (cards), Stats 24
(split con gráfica), Table 5 (tabla), Layout 637 (card partida). Valores en tinta de texto;
el verde solo en filetes y marcas, nunca en cifras (no da contraste).
Imágenes en R2 (`assets/r2.ts`): marco de Entrega (cifra 69,1 % en placa blanca abajo a la
izquierda) y columna izquierda de ¿Qué puede hacer una empresa?.

## Superficies y ritmo

Hero: bloque tipográfico a sangre sobre el canvas claro (estructura de MWG 044): titular en tres
líneas justificadas (`--aa-lockup-size` en cqi contra el ancho del frame) con el video dentro del
texto, "WhatsApp" en verde de marca y letter ripple en todos sus textos (MWG 041, como el
HeroHoverList del portfolio). Sin fila meta, logo ni navbar: la landing se monta en una página host
que ya los trae. Debajo, banda separadora con el embudo en marquee (`sections/marquee-band.ts`,
MWG 024 compact). El formulario (`#aa-descarga`) va en la columna derecha de Medir → mejorar (`InfoContent.form`), una
strip clara a sangre (`canvas`); con form, los ítems van en accordion (primero abierto) para que la
columna no crezca más que el form.

Cada sección declara `surface` en content.ts (tipo `Surface` en ui/layout.ts) y opcionalmente
`join: true` para fundirse con la anterior en un solo bloque. section-theme.css no conoce ids:

| surface | Qué es |
|---|---|
| `canvas` | strip clara a sangre, transparente sobre el bg fijo, sin card (Medir → mejorar) |
| `card` | card squircle blanca flotante (strip full-bleed en móvil) |
| `sheet` | banda obsidian `--aa-surface-obsidian` a sangre, con textura invertida tenue |
| `accent` | banda verde a sangre con textura overlay; tinta oscura, `--aa-accent` pasa a tinta |
| `card-dark` | card squircle obsidian sobre canvas (el container lleva el tema dark) |
| `media` | video de fondo + overlay |

Las bandas de color no llevan radio ni separación entre sí. content-sections.ts marca `is--head` /
`is--tail` según `join`. Cards unidas se leen como una sola: sin radio ni padding de sección en la
costura y un filete de contenido al abrir la siguiente (Base + Medir eficiencia). `.aa-stats-block`
es card por sí mismo en strips claras cuando no vive dentro de otra card. La forma es
`corner-shape: squircle` con el radio doblado bajo `@supports` (fallback: radio circular); padding
interno `--aa-padding-card`. Origen: los patrones de Academy (tesis+problema, visión verde,
info/form blancos, generación oscura), que allá vivían en CSS por id.

Ritmo actual: card (+join ×2: Eficiencia, Base, Ficha) → sheet (+join) → accent → card (mapa) → sheet (Benchmark) → canvas (Medir → mejorar + form).
Metodología del PDF (p. 8) repartida junto a lo que explica, sin acordeón: Datos, Periodo, Cómo
medimos y Privacidad en la Ficha (kind `facts`); los cortes como `mapNote` bajo el mapa (pasan bajo
la tabla en F3); el alcance cierra Benchmark. Privacidad se repite junto al form en F4.
Uniones previstas con sublayouts de Relume: embudo en la banda de Entrega (riel de Timeline 20),
países/industrias bajo el mapa (Card Header 1 + Stat Card 7), tabla y cuartiles bajo Benchmark
(Card Header 1 + Table 5 + Description List 1).
Pendientes con hueco: países/industrias en canvas, tabla en card, cuartiles en card-dark,
descarga en media (cierre).

## Tests

`node --test test/study.test.ts` (Node 22.18+ ejecuta TS sin build). Cruza métricas derivadas
del PDF (msj/resp = entrega ÷ respuesta, tasas sobre entregados, brecha de cuartiles) y el
formato es-LATAM. Sin script en package.json: editarlo requiere aprobación.

## Estructura

```
src/
├── index.ts                  # boot: lee el mount, renderiza .aa-landing, init de widgets
├── content.ts                # copy + tipos de sección (prose/statement/checklist/info/faq/cta)
├── core/                     # types, dom helpers
├── assets/r2.ts              # URLs públicas de R2 (textura)
├── sections/                 # hero, content-sections (renderers por kind + superficie)
├── ui/                       # layout, text, motion, gsap-env, accordion, rotating-text, button004, meta-theme
│   └── atoms/                # button, input, checkbox (input/checkbox se usan en F4)
└── styles/landing.css        # índice de @import del DS (form.css queda para F4)
```

## Animaciones (data attributes)

| Atributo | Efecto |
|---|---|
| `data-aa-intro` | hijos animan al montar (above the fold) |
| `data-aa-split` | SplitText: words suben con rotate + stagger |
| `data-aa-fade` | fade + translateY, `data-aa-delay` opcional |
| `data-aa-stagger` | stagger sobre hijos directos |

## Gotcha heredado: plugins de "delay JS" en WordPress

Si el host es WordPress con WP Meteor / WP Rocket / Perfmatters, el loader se retrasa hasta la
primera interacción y la página queda en blanco. Eximir el `<script>` del loader (WP Meteor:
`data-wpmeteor-nooptimize="true"`). `data-cfasync="false"` solo cubre Cloudflare Rocket Loader.

## Reglas de operación

- CSS prefijado `.aa-*` bajo `.aa-landing`: nunca selectores globales
- Sin secretos en el bundle: es público. El token del Apps Script vive solo en env de Vercel
- Números del estudio en una sola fuente de datos (F1), nunca escritos a mano en el markup
- Deploy por CLI (git deploy bloqueado por `TEAM_ACCESS_REQUIRED`); lo ejecuta Karen
