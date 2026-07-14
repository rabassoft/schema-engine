import type {
  DataPath,
  Diagnostic,
  NumberFieldDefinition,
  FieldTemplate,
} from '@rabassoft/schema-engine';
import { adapterDiagnostic } from '../renderer.js';

export type NumericParseResult =
  | { readonly kind: 'empty' }
  | { readonly kind: 'incomplete' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'value'; readonly value: number };

export interface NumberCodec {
  readonly locale: string;
  readonly diagnostics: readonly Diagnostic[];
  parse(text: string, integer: boolean): NumericParseResult;
  format(
    value: number,
    field: NumberRendererField,
  ): {
    readonly text: string;
    readonly diagnostics: readonly Diagnostic[];
  };
  formatEditing(
    value: number,
    field: NumberRendererField,
  ): {
    readonly text: string;
    readonly diagnostics: readonly Diagnostic[];
  };
}

interface LocaleSymbols {
  readonly decimal: string;
  readonly group?: string;
  readonly minus: string;
  readonly literals: readonly string[];
  readonly digits: ReadonlyMap<string, string>;
  readonly primaryGroup: number;
  readonly secondaryGroup: number;
}

export function createNumberCodec(
  requestedLocale: string,
  field: NumberRendererField,
  diagnosticPath: DataPath | undefined = 'path' in field
    ? field.path
    : undefined,
): NumberCodec {
  let locale = requestedLocale;
  let diagnostics: readonly Diagnostic[] = Object.freeze([]);
  try {
    new Intl.NumberFormat(locale).format(0);
  } catch {
    locale = 'en-US';
    diagnostics = Object.freeze([
      adapterDiagnostic(
        'INVALID_NUMBER_LOCALE',
        'warning',
        { field: field.name, locale: requestedLocale, fallbackLocale: locale },
        `Number locale "${requestedLocale}" is invalid; "${locale}" is used.`,
        diagnosticPath,
      ),
    ]);
  }
  const symbols = localeSymbols(locale);
  const codec: NumberCodec = {
    locale,
    diagnostics,
    parse: (text: string, integer: boolean) =>
      parseNumber(text, symbols, integer),
    format: (value: number, definition: NumberRendererField) =>
      formatNumber(value, locale, definition, true, diagnosticPath),
    formatEditing: (value: number, definition: NumberRendererField) =>
      formatNumber(value, locale, definition, false, diagnosticPath),
  };
  return Object.freeze(codec);
}

type NumberRendererField =
  NumberFieldDefinition | Extract<FieldTemplate, { readonly kind: 'number' }>;

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
  if (integerText === '' && fractionText === undefined)
    return Object.freeze({ kind: 'incomplete' });
  const normalizedInteger = normalizeInteger(integerText, symbols);
  if (normalizedInteger === undefined)
    return Object.freeze({ kind: 'invalid' });
  const normalizedFraction =
    fractionText === undefined
      ? undefined
      : normalizeDigits(fractionText, symbols);
  if (fractionText !== undefined && normalizedFraction === undefined)
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
  diagnosticPath: DataPath | undefined,
): { readonly text: string; readonly diagnostics: readonly Diagnostic[] } {
  const decimalPlaces = field.ui.decimalPlaces;
  if (decimalPlaces !== undefined && decimalPlaces > 100)
    return failedFormat(
      value,
      locale,
      field,
      'unsupported-decimal-places',
      diagnosticPath,
    );
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
    return Object.freeze({
      text: new Intl.NumberFormat(locale, options).format(value),
      diagnostics: Object.freeze([]),
    });
  } catch {
    return failedFormat(value, locale, field, 'intl-failure', diagnosticPath);
  }
}

function failedFormat(
  value: number,
  locale: string,
  field: NumberRendererField,
  reason: string,
  diagnosticPath: DataPath | undefined,
) {
  return Object.freeze({
    text: String(value),
    diagnostics: Object.freeze([
      adapterDiagnostic(
        'NUMBER_FORMAT_FAILED',
        'warning',
        { field: field.name, locale, reason },
        `Number formatting failed for field "${field.name}".`,
        diagnosticPath,
      ),
    ]),
  });
}
