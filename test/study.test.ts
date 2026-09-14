// Contrato de los datos del estudio y su formato. Los números se transcriben a mano desde el
// PDF: estas pruebas detectan erratas cruzando métricas que el propio estudio deriva entre sí.
// Correr con: node --test test/

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, formatMetric } from '../src/data/format.ts';
import {
  BASE,
  FUNNEL,
  READ_OF_DELIVERED,
  REPLY_OF_DELIVERED,
  DELIVERED_PER_REPLY,
  COUNTRIES,
  INDUSTRIES,
  DISTRIBUTION,
} from '../src/data/study.ts';
import { LATAM_COUNTRIES } from '../src/data/latam-map.ts';

const NBSP = '\u00a0';

function near(actual: number, expected: number, tolerance: number, what: string): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: ${actual} no está a ±${tolerance} de ${expected}`,
  );
}

describe('formatNumber', () => {
  it('agrupa miles con punto, también en números de 4 cifras', () => {
    assert.equal(formatNumber(11481784), '11.481.784');
    assert.equal(formatNumber(5250000), '5.250.000');
    assert.equal(formatNumber(1000), '1.000');
    assert.equal(formatNumber(438), '438');
  });

  it('usa coma decimal y respeta los decimales pedidos', () => {
    assert.equal(formatNumber(69.1, 1), '69,1');
    assert.equal(formatNumber(22, 1), '22,0');
    assert.equal(formatNumber(0.81, 2), '0,81');
  });

  it('redondea valores intermedios del conteo animado', () => {
    assert.equal(formatNumber(6.4999, 1), '6,5');
    assert.equal(formatNumber(1234.6), '1.235');
  });
});

describe('formatMetric', () => {
  it('pega la unidad sin que el número y el % se separen de línea', () => {
    assert.equal(formatMetric({ value: 69.1, decimals: 1, unit: '%' }), `69,1${NBSP}%`);
    assert.equal(formatMetric({ value: 3.2, decimals: 1, unit: '×' }), '3,2×');
    assert.equal(formatMetric({ value: 438, decimals: 0 }), '438');
  });
});

describe('datos del estudio', () => {
  it('la tabla por país tiene tantos países como declara la base', () => {
    assert.equal(COUNTRIES.length, BASE.countries);
  });

  it('los cortes por país no superan el universo total', () => {
    const environments = COUNTRIES.reduce((sum, c) => sum + c.environments, 0);
    const messages = COUNTRIES.reduce((sum, c) => sum + c.messages, 0);
    assert.ok(environments <= BASE.environments);
    assert.ok(messages <= BASE.messages);
  });

  it('msj/resp de cada país coincide con entrega ÷ respuesta', () => {
    COUNTRIES.forEach((c) => near(c.delivery / c.reply, c.perReply, 0.1, c.name));
  });

  it('entrega + fallo de cada país no supera el 100 %', () => {
    COUNTRIES.forEach((c) => assert.ok(c.delivery + c.fail <= 100, c.name));
  });

  it('el embudo nunca crece de un paso al siguiente', () => {
    for (let i = 1; i < FUNNEL.length; i += 1) {
      assert.ok(FUNNEL[i].share <= FUNNEL[i - 1].share, FUNNEL[i].step);
    }
  });

  it('las tasas sobre entregados salen del embudo', () => {
    const delivered = FUNNEL.find((s) => s.step === 'Entregados')!.share;
    const read = FUNNEL.find((s) => s.step === 'Leídos')!.share;
    const replied = FUNNEL.find((s) => s.step === 'Respondidos')!.share;
    near((read / delivered) * 100, READ_OF_DELIVERED, 0.1, 'lectura sobre entregados');
    near((replied / delivered) * 100, REPLY_OF_DELIVERED, 0.1, 'respuesta sobre entregados');
    near(delivered / replied, DELIVERED_PER_REPLY, 0.1, 'promedio msj/resp');
  });

  it('hay 9 industrias', () => {
    assert.equal(INDUSTRIES.length, 9);
  });

  it('cada país del estudio tiene forma y ancla en el mapa', () => {
    COUNTRIES.forEach((c) => {
      const shape = LATAM_COUNTRIES[c.name];
      assert.ok(shape, `sin forma en el mapa: ${c.name}`);
      assert.match(shape.d, /^M[\d.]+ [\d.]+L/, `path vacío: ${c.name}`);
    });
    assert.equal(Object.keys(LATAM_COUNTRIES).length, COUNTRIES.length);
  });

  it('la brecha entre cuartiles de respuesta es la que cita el texto (3,2×)', () => {
    const { low, high } = DISTRIBUTION.reply;
    near(high / low, 3.2, 0.05, 'cuartil alto ÷ cuartil bajo');
  });
});
