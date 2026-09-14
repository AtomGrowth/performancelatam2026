#!/usr/bin/env python3
"""Genera src/data/latam-map.ts a partir del mapa de comunidad de OSMO.

Fuente: OSMO/images/community/network-map.svg (1010x666). Cada <path> agrupa varios países
del mismo color como subpaths; aquí se separan, se asigna id a los 14 países del estudio
(con sus islas) y el resto de Latinoamérica queda como contexto sin id. La geometría se
simplifica (Ramer-Douglas-Peucker) para que el bundle público no cargue ~1 MB de paths.

Uso: python3 scripts/latam-map.py <ruta a network-map.svg>
Los ids de subpath se identificaron visualmente sobre renders etiquetados; si cambia el SVG
de origen, hay que volver a verificarlos.
"""

import json
import re
import sys
from pathlib import Path

# Subpath principal (índice de <path>.índice de subpath) por país del estudio.
MAINLAND = {
    'México': '87.0',
    'Guatemala': '55.0',
    'El Salvador': '109.9',
    'Honduras': '56.15',
    'Nicaragua': '90.0',
    'Costa Rica': '33.0',
    'Panamá': '94.4',
    'Colombia': '32.0',
    'Ecuador': '38.3',
    'Perú': '94.9',
    'Brasil': '19.0',
    'Paraguay': '98.2',
    'Chile': '30.0',
    'Argentina': '6.0',
}

VIEWBOX = (140.0, 362.0, 250.0, 304.0)  # México → Tierra del Fuego (incluye el extremo sur)
ISLAND_MARGIN = 4.0  # una isla pertenece al país si cae en su bbox ampliado (mismo <path>)
MIN_AREA = 0.4  # descarta islotes que no se ven al tamaño de render
EPSILON = 0.12  # tolerancia RDP en unidades del mapa (~0.3 px al tamaño de render)

TOKEN = re.compile(r'[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e-?\d+)?')
ARGS = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'S': 4, 'Q': 4, 'T': 2, 'A': 7, 'Z': 0}


def polylines(d):
    """Devuelve una lista de polilíneas absolutas (una por subpath). Curvas → su punto final."""
    toks = TOKEN.findall(d)
    i = 0
    x = y = sx = sy = 0.0
    cmd = None
    out, cur = [], None
    while i < len(toks):
        t = toks[i]
        if re.match(r'[A-Za-z]', t):
            cmd = t
            i += 1
            if cmd in 'Zz':
                x, y = sx, sy
                continue
            if cmd in 'Mm':
                vals = [float(v) for v in toks[i:i + 2]]
                i += 2
                x = vals[0] + (x if cmd == 'm' else 0)
                y = vals[1] + (y if cmd == 'm' else 0)
                sx, sy = x, y
                cur = [(x, y)]
                out.append(cur)
                cmd = 'l' if cmd == 'm' else 'L'
                continue
        n = ARGS[cmd.upper()]
        vals = [float(v) for v in toks[i:i + n]]
        i += n
        rel = cmd.islower()
        kind = cmd.upper()
        if kind == 'H':
            x = vals[0] + (x if rel else 0)
        elif kind == 'V':
            y = vals[0] + (y if rel else 0)
        elif kind == 'A':
            x, y = vals[5] + (x if rel else 0), vals[6] + (y if rel else 0)
        else:
            x, y = vals[n - 2] + (x if rel else 0), vals[n - 1] + (y if rel else 0)
        cur.append((x, y))
    return out


def rdp(points, eps):
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        (ax, ay), (bx, by) = points[a], points[b]
        dx, dy = bx - ax, by - ay
        norm = (dx * dx + dy * dy) ** 0.5 or 1e-9
        best, idx = 0.0, None
        for k in range(a + 1, b):
            px, py = points[k]
            dist = abs(dy * px - dx * py + bx * ay - by * ax) / norm
            if dist > best:
                best, idx = dist, k
        if idx is not None and best > eps:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(points, keep) if k]


def bbox(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return min(xs), min(ys), max(xs), max(ys)


def to_d(points):
    pts = rdp(points, EPSILON)
    if len(pts) < 3:
        return ''
    head = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    return head + ''.join(f'L{x:.1f} {y:.1f}' for x, y in pts[1:]) + 'Z'


def main(src):
    svg = Path(src).read_text(encoding='utf-8')
    records = {}
    for pi, attrs in enumerate(re.findall(r'<path([^>]*)/>', svg)):
        if 'fill="#fff"' in attrs:
            continue
        d = re.search(r'\sd="([^"]+)"', attrs).group(1)
        for si, pts in enumerate(polylines(d)):
            if len(pts) < 3:
                continue
            x0, y0, x1, y1 = bbox(pts)
            records[f'{pi}.{si}'] = {'path': pi, 'pts': pts, 'bbox': (x0, y0, x1, y1), 'area': (x1 - x0) * (y1 - y0)}

    missing = [name for name, sid in MAINLAND.items() if sid not in records]
    if missing:
        sys.exit(f'Subpaths inexistentes para: {missing}')

    vx, vy, vw, vh = VIEWBOX
    assigned = {}
    countries = {}
    for name, sid in MAINLAND.items():
        main_rec = records[sid]
        x0, y0, x1, y1 = main_rec['bbox']
        parts = [sid]
        for rid, rec in records.items():
            if rid == sid or rec['path'] != main_rec['path'] or rec['area'] < MIN_AREA:
                continue
            cx = (rec['bbox'][0] + rec['bbox'][2]) / 2
            cy = (rec['bbox'][1] + rec['bbox'][3]) / 2
            if x0 - ISLAND_MARGIN <= cx <= x1 + ISLAND_MARGIN and y0 - ISLAND_MARGIN <= cy <= y1 + ISLAND_MARGIN:
                parts.append(rid)
        assigned.update({rid: name for rid in parts})
        d = ''.join(to_d(records[rid]['pts']) for rid in parts)
        # Ancla de etiqueta: centro del bbox continental (Chile es angosto: se ancla al norte-centro).
        label = ((x0 + x1) / 2, (y0 + y1) / 2)
        countries[name] = {'d': d, 'label': [round(label[0], 1), round(label[1], 1)]}

    context = []
    for rid, rec in records.items():
        if rid in assigned or rec['area'] < MIN_AREA:
            continue
        cx = (rec['bbox'][0] + rec['bbox'][2]) / 2
        cy = (rec['bbox'][1] + rec['bbox'][3]) / 2
        if vx <= cx <= vx + vw and vy <= cy <= vy + vh:
            context.append(to_d(rec['pts']))

    ts = (
        '// Generado por scripts/latam-map.py desde OSMO/images/community/network-map.svg.\n'
        '// No editar a mano: regenerar el script. Geometría simplificada (RDP) en el espacio 1010x666\n'
        '// del mapa original; el viewBox recorta Latinoamérica. Sin imports: lo carga node --test.\n\n'
        f"export const LATAM_VIEWBOX = '{vx:g} {vy:g} {vw:g} {vh:g}';\n\n"
        '// Resto de Latinoamérica y el Caribe, sin datos del estudio.\n'
        f'export const LATAM_CONTEXT = {json.dumps("".join(context))};\n\n'
        'export interface MapCountry {\n'
        '  d: string;\n'
        '  label: [number, number]; // ancla en coordenadas del mapa\n'
        '}\n\n'
        'export const LATAM_COUNTRIES: Record<string, MapCountry> = '
        + json.dumps(countries, ensure_ascii=False, indent=2)
        + ';\n'
    )
    out = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'latam-map.ts'
    out.write_text(ts, encoding='utf-8')
    print(f'{out} {out.stat().st_size / 1024:.1f} KB · {len(countries)} países · {len(context)} formas de contexto')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Uso: python3 scripts/latam-map.py <ruta a network-map.svg>')
    main(sys.argv[1])
