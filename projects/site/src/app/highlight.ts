/**
 * Minimal HTML/Angular-template highlighter for the page's own static samples.
 * Not a general parser: it only needs tags, attributes, bindings, strings and text.
 */

export type TokenKind = 'punct' | 'tag' | 'attr' | 'binding' | 'string' | 'text';

export interface Token {
  kind: TokenKind;
  text: string;
}

/** Inside a tag: whitespace, `/>`/`>`, `=`, a quoted string, or an attribute name. */
const IN_TAG = /(\s+)|(\/?>)|(=)|("[^"]*")|([^\s=/>]+)/y;

/** Angular bindings and Vadem directives get their own colour. */
const isBinding = (name: string) => /^[[(]/.test(name) || /^vd[A-Z]/.test(name);

export function highlight(source: string): Token[][] {
  return source.split('\n').map(highlightLine);
}

function highlightLine(line: string): Token[] {
  const tokens: Token[] = [];
  const push = (kind: TokenKind, text: string) => text && tokens.push({ kind, text });
  // Lines that continue a tag (attribute rows) start inside it.
  let inTag = !/^\s*</.test(line) && /=|\/?>\s*$/.test(line);
  let i = 0;
  while (i < line.length) {
    if (!inTag) {
      const open = /<\/?([\w-]+)/y;
      open.lastIndex = i;
      const m = open.exec(line);
      if (m) {
        push('punct', m[0].slice(0, m[0].length - m[1].length));
        push('tag', m[1]);
        i = open.lastIndex;
        inTag = true;
        continue;
      }
      const next = line.indexOf('<', i);
      const end = next === -1 ? line.length : next;
      push('text', line.slice(i, end));
      i = end;
      continue;
    }
    IN_TAG.lastIndex = i;
    const m = IN_TAG.exec(line);
    if (!m) {
      push('text', line.slice(i));
      break;
    }
    const [all, space, close, eq, str, name] = m;
    if (space) push('text', space);
    else if (close) {
      push('punct', close);
      inTag = false;
    } else if (eq) push('punct', eq);
    else if (str) push('string', str);
    else if (name) push(isBinding(name) ? 'binding' : 'attr', name);
    i += all.length;
  }
  return tokens;
}
