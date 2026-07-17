import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export const referenceSyntaxTheme: ReturnType<typeof syntaxHighlighting> =
  syntaxHighlighting(
    HighlightStyle.define([
      {
        tag: [tags.keyword, tags.modifier, tags.operatorKeyword],
        color: 'var(--syntax-keyword)',
        fontWeight: '600',
      },
      {
        tag: [tags.string, tags.special(tags.string), tags.regexp],
        color: 'var(--syntax-string)',
      },
      {
        tag: [tags.number, tags.bool, tags.null],
        color: 'var(--syntax-literal)',
      },
      {
        tag: [
          tags.propertyName,
          tags.attributeName,
          tags.tagName,
          tags.typeName,
          tags.className,
        ],
        color: 'var(--syntax-property)',
      },
      {
        tag: [tags.variableName, tags.function(tags.variableName)],
        color: 'var(--syntax-name)',
      },
      {
        tag: [tags.comment, tags.lineComment, tags.blockComment],
        color: 'var(--syntax-comment)',
        fontStyle: 'italic',
      },
      {
        tag: tags.invalid,
        color: 'var(--color-danger)',
        textDecoration: 'underline',
      },
    ]),
  );
