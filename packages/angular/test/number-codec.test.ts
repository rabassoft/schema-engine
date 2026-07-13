import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  compileFormDefinition,
  type NumberFieldDefinition,
} from '@rabassoft/schema-engine';
import { describe, expect, it } from 'vitest';
import { createNumberCodec } from '../dist/native/number-codec.js';

interface Fixture {
  readonly locale: string;
  readonly numericType: 'number' | 'integer';
  readonly text: string;
  readonly kind: 'empty' | 'incomplete' | 'invalid' | 'value';
  readonly value?: number;
  readonly negativeZero?: boolean;
}

const fixtures = JSON.parse(
  readFileSync(resolve('test/number/fixtures/parse.json'), 'utf8'),
) as Fixture[];

describe('localized number codec', () => {
  for (const fixture of fixtures) {
    it(`${fixture.locale} ${fixture.numericType} ${JSON.stringify(fixture.text)}`, () => {
      const field = numberField(fixture.numericType);
      const result = createNumberCodec(fixture.locale, field).parse(
        fixture.text,
        fixture.numericType === 'integer',
      );
      expect(result.kind).toBe(fixture.kind);
      if (result.kind === 'value') {
        expect(Object.is(result.value, -0)).toBe(fixture.negativeZero === true);
        if (!fixture.negativeZero) expect(result.value).toBe(fixture.value);
      }
    });
  }

  it('formats display precision without changing the model value', () => {
    const field = numberField('number', {
      decimalPlaces: 2,
      showTrailingZeros: true,
    });
    const codec = createNumberCodec('en-US', field);
    const result = codec.format(1234.567, field);
    expect(result.text).toBe('1,234.57');
    expect(result.diagnostics).toEqual([]);
    expect(codec.formatEditing(1234.567, field).text).toBe('1234.567');

    const rtlCodec = createNumberCodec('ar-EG', field);
    const rtlEditing = rtlCodec.formatEditing(-12.5, field).text;
    expect(rtlCodec.parse(rtlEditing, false)).toEqual({
      kind: 'value',
      value: -12.5,
    });
  });

  it('falls back safely for invalid locales', () => {
    const field = numberField('number');
    const codec = createNumberCodec('not_a_locale', field);
    expect(codec.locale).toBe('en-US');
    expect(codec.diagnostics).toMatchObject([
      { code: 'INVALID_NUMBER_LOCALE' },
    ]);
  });
});

function numberField(
  numericType: 'number' | 'integer',
  options: { decimalPlaces?: number; showTrailingZeros?: boolean } = {},
): NumberFieldDefinition {
  const result = compileFormDefinition({
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { amount: { type: numericType } },
    },
    uiSchema: { fields: { amount: { options } } },
  });
  if (!result.success || result.definition.fields[0]?.kind !== 'number')
    throw new Error('numeric fixture compilation failed');
  return result.definition.fields[0];
}
