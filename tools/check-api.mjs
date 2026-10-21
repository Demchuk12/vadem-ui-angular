#!/usr/bin/env node
// Public API snapshot: exports, component/directive selectors, inputs and outputs of every
// entry point, read from the built type declarations (dist/ui/types). Run after `build:ui`.
//   node tools/check-api.mjs           fail when the snapshot differs from docs/api-surface.json
//   node tools/check-api.mjs --update  rewrite the snapshot after an intentional API change
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const typesDir = join(root, 'dist/ui/types');
const snapshotPath = join(root, 'docs/api-surface.json');

if (!existsSync(typesDir)) {
  console.error('dist/ui/types is missing. Run `npm run build:ui` first.');
  process.exit(1);
}

const sortedUnique = (list) => [...new Set(list)].sort((a, b) => a.localeCompare(b, 'en'));

function memberNames(node) {
  if (!node || !ts.isTypeLiteralNode(node)) return [];
  return node.members.map((m) => {
    const name = m.name.getText().replace(/^"|"$/g, '');
    const optional = m.type && ts.isTypeLiteralNode(m.type) ? requiredFlag(m.type) : false;
    return optional ? `${name}!` : name;
  });
}

function requiredFlag(literal) {
  return literal.members.some(
    (m) => m.name?.getText() === 'required' && m.type?.getText() === 'true',
  );
}

function outputNames(node) {
  if (!node || !ts.isTypeLiteralNode(node)) return [];
  // `{ "value": "valueChange" }` maps the class property to the public event name.
  return node.members.map((m) => m.type?.getText().replace(/^"|"$/g, '') ?? m.name.getText());
}

function describe(file) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const exports = [];
  const declared = new Map();
  const surface = {};

  for (const statement of source.statements) {
    if (ts.isClassDeclaration(statement) && statement.name) {
      declared.set(statement.name.text, statement);
      for (const member of statement.members) {
        const name = member.name?.getText();
        if (name !== 'ɵcmp' && name !== 'ɵdir') continue;
        const ref = member.type;
        if (!ref || !ts.isTypeReferenceNode(ref) || !ref.typeArguments) continue;
        const [, selector, , inputs, outputs] = ref.typeArguments;
        surface[statement.name.text] = {
          kind: name === 'ɵcmp' ? 'component' : 'directive',
          selector: selector ? selector.getText().replace(/^"|"$/g, '') : 'never',
          inputs: sortedUnique(memberNames(inputs)),
          outputs: sortedUnique(outputNames(outputs)),
        };
      }
    }
    if (ts.isExportDeclaration(statement) && statement.exportClause) {
      for (const el of statement.exportClause.elements) {
        exports.push(el.name.text + (statement.isTypeOnly || el.isTypeOnly ? ' (type)' : ''));
      }
    }
    const exported = ts
      .getModifiers(statement)
      ?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (exported) {
      const names = ts.isVariableStatement(statement)
        ? statement.declarationList.declarations.map((d) => d.name.getText())
        : statement.name
          ? [statement.name.text]
          : [];
      const typeOnly = ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement);
      for (const n of names) exports.push(n + (typeOnly ? ' (type)' : ''));
    }
  }
  // Only the public surface: drop the internal declarations that are not exported.
  const exportedNames = new Set(exports.map((e) => e.replace(' (type)', '')));
  const publicSurface = Object.fromEntries(
    Object.entries(surface)
      .filter(([cls]) => exportedNames.has(cls))
      .sort(([a], [b]) => a.localeCompare(b, 'en')),
  );
  return { exports: sortedUnique(exports), classes: publicSurface };
}

const snapshot = {};
for (const file of readdirSync(typesDir)
  .filter((f) => f.endsWith('.d.ts'))
  .sort()) {
  const entry = file.replace(/^vadem-ui-?/, '').replace(/\.d\.ts$/, '');
  snapshot[entry ? `@vadem/ui/${entry}` : '@vadem/ui'] = describe(join(typesDir, file));
}

const next = JSON.stringify(snapshot, null, 2) + '\n';
if (process.argv.includes('--update')) {
  writeFileSync(snapshotPath, next);
  console.log(`API snapshot written: ${Object.keys(snapshot).length} entry points.`);
  process.exit(0);
}
if (!existsSync(snapshotPath) || readFileSync(snapshotPath, 'utf8') !== next) {
  const before = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, 'utf8')) : {};
  const changed = sortedUnique([...Object.keys(before), ...Object.keys(snapshot)]).filter(
    (k) => JSON.stringify(before[k]) !== JSON.stringify(snapshot[k]),
  );
  console.error(`Public API changed in: ${changed.join(', ') || 'snapshot file'}`);
  console.error(
    'If intentional, run `npm run update:api`, review the diff and note it in CHANGELOG.md.',
  );
  process.exit(1);
}
console.log(`Public API matches the snapshot (${Object.keys(snapshot).length} entry points).`);
