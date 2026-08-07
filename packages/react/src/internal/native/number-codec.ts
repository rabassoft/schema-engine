// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  FieldTemplate,
  NumberFieldDefinition,
} from '@rabassoft/schema-engine';

export type NumberRendererField =
  NumberFieldDefinition | Extract<FieldTemplate, { readonly kind: 'number' }>;

export type NumericParseResult =
  | { readonly kind: 'empty' }
  | { readonly kind: 'incomplete' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'value'; readonly value: number };

interface LocaleSymbols {
  readonly decimal: string;
  readonly group?: string;
  readonly minus: string;
  readonly literals: readonly string[];
  readonly digits: ReadonlyMap<string, string>;
  readonly primaryGroup: number;
  readonly secondaryGroup: number;
}

export interface NumberCodec {
  parse(text: string, integer: boolean): NumericParseResult;
  format(value: number, field: NumberRendererField): string;
  formatEditing(value: number, field: NumberRendererField): string;
}

export function createNumberCodec(requestedLocale: string): NumberCodec {
  let locale = requestedLocale;
  try {
    new Intl.NumberFormat(locale).format(0);
  } catch {
    locale = 'en-US';
  }
  const symbols = localeSymbols(locale);
  return Object.freeze({
    parse: (text: string, integer: boolean) =>
      parseNumber(text, symbols, integer),
    format: (value: number, field: NumberRendererField) =>
      formatNumber(value, locale, field, true),
    formatEditing: (value: number, field: NumberRendererField) =>
      formatNumber(value, locale, field, false),
  });
}

function localeSymbols(locale: string): LocaleSymbols {
  const digits = new Map<string, string>();
  const plain = new Intl.NumberFormat(locale, { useGrouping: false });
  for (let value = 0; value <= 9; value += 1)
    digits.set(plain.format(value), String(value));
  const parts = new Intl.NumberFormat(locale, {
    useGrouping: true,
  }).formatToParts(-1234567890123.5);
  const integerGroups = parts
    .filter(({ type }) => type === 'integer')
    .map(({ value }) => [...value].length);
  const group = parts.find(({ type }) => type === 'group')?.value;
  return Object.freeze({
    decimal: parts.find(({ type }) => type === 'decimal')?.value ?? '.',
    ...(group === undefined ? {} : { group }),
    minus: parts.find(({ type }) => type === 'minusSign')?.value ?? '-',
    literals: Object.freeze(
      parts.filter(({ type }) => type === 'literal').map(({ value }) => value),
    ),
    digits,
    primaryGroup: integerGroups.at(-1) ?? 3,
    secondaryGroup: integerGroups.at(-2) ?? integerGroups.at(-1) ?? 3,
  });
}

function parseNumber(
  source: string,
  symbols: LocaleSymbols,
  integer: boolean,
): NumericParseResult {
  let text = source.trim();
  for (const literal of symbols.literals)
    text = text.split(literal).join('').trim();
  if (text.length === 0) return Object.freeze({ kind: 'empty' });
  let unsigned = text;
  let negative = false;
  if (unsigned.startsWith(symbols.minus) || unsigned.startsWith('-')) {
    negative = true;
    unsigned = unsigned.slice(
      unsigned.startsWith(symbols.minus) ? symbols.minus.length : 1,
    );
  }
  if (unsigned.length === 0) return Object.freeze({ kind: 'incomplete' });
  const decimalParts = unsigned.split(symbols.decimal);
  if (decimalParts.length > 2) return Object.freeze({ kind: 'invalid' });
  if (decimalParts.length === 2 && decimalParts[1] === '')
    return Object.freeze({ kind: 'incomplete' });
  const [integerText = '', fractionText] = decimalParts;
  const normalizedInteger = normalizeInteger(integerText, symbols);
  const normalizedFraction =
    fractionText === undefined
      ? undefined
      : normalizeDigits(fractionText, symbols);
  if (
    normalizedInteger === undefined ||
    (fractionText !== undefined && normalizedFraction === undefined)
  )
    return Object.freeze({ kind: 'invalid' });
  const canonical = `${negative ? '-' : ''}${normalizedInteger || '0'}${
    normalizedFraction === undefined ? '' : `.${normalizedFraction}`
  }`;
  const value = Number(canonical);
  if (!Number.isFinite(value) || (integer && !Number.isInteger(value)))
    return Object.freeze({ kind: 'invalid' });
  return Object.freeze({ kind: 'value', value });
}

function normalizeInteger(
  text: string,
  symbols: LocaleSymbols,
): string | undefined {
  if (symbols.group === undefined || !text.includes(symbols.group))
    return normalizeDigits(text, symbols);
  const groups = text.split(symbols.group);
  if (groups.some((group) => group.length === 0)) return undefined;
  const normalized = groups.map((group) => normalizeDigits(group, symbols));
  if (normalized.some((group) => group === undefined)) return undefined;
  const lengths = normalized.map((group) => group?.length ?? 0);
  if (lengths.at(-1) !== symbols.primaryGroup) return undefined;
  if (
    lengths.slice(1, -1).some((length) => length !== symbols.secondaryGroup) ||
    lengths[0] === 0 ||
    (lengths[0] ?? 0) > symbols.secondaryGroup
  )
    return undefined;
  return normalized.join('');
}

function normalizeDigits(
  text: string,
  symbols: LocaleSymbols,
): string | undefined {
  let result = '';
  for (const character of text) {
    const digit = symbols.digits.get(character);
    if (digit === undefined) return undefined;
    result += digit;
  }
  return result;
}

function formatNumber(
  value: number,
  locale: string,
  field: NumberRendererField,
  useGrouping: boolean,
): string {
  const decimalPlaces = field.ui.decimalPlaces;
  if (decimalPlaces !== undefined && decimalPlaces > 100) return String(value);
  try {
    const options: Intl.NumberFormatOptions = !useGrouping
      ? {
          useGrouping: false,
          minimumFractionDigits: 0,
          maximumFractionDigits: field.numericType === 'integer' ? 0 : 20,
        }
      : field.numericType === 'integer'
        ? {
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }
        : {
            useGrouping: true,
            minimumFractionDigits:
              decimalPlaces !== undefined && field.ui.showTrailingZeros === true
                ? decimalPlaces
                : 0,
            maximumFractionDigits: decimalPlaces ?? 20,
          };
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}
