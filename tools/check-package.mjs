// Validate the built or installed package, including the files actually copied into it.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

export async function checkPackage(packageDir = join(root, 'dist/ui')) {
  const expected = json(join(root, 'projects/ui/package.json'));
  const manifest = json(join(packageDir, 'package.json'));
  assert.equal(manifest.name, expected.name);
  assert.equal(manifest.version, expected.version, 'Built manifest version is stale.');
  assert.deepEqual(manifest.peerDependencies, expected.peerDependencies);
  assert.deepEqual(manifest.repository, expected.repository);
  assert.deepEqual(manifest.publishConfig, expected.publishConfig);
  assert.equal(manifest.license, expected.license);
  const { VD_VERSION } = await import(
    pathToFileURL(join(packageDir, manifest.exports['.'].default))
  );
  assert.equal(VD_VERSION, manifest.version, 'VD_VERSION must match projects/ui/package.json.');

  const entries = readdirSync(join(root, 'projects/ui')).filter((entry) => {
    try {
      return statSync(join(root, 'projects/ui', entry, 'ng-package.json')).isFile();
    } catch {
      return false;
    }
  });
  for (const entry of entries) {
    const exported = manifest.exports[`./${entry}`];
    assert.ok(exported?.types && exported?.default, `Missing package export: ${entry}`);
    for (const target of [exported.types, exported.default]) {
      assert.ok(statSync(join(packageDir, target)).isFile(), `Missing export target: ${target}`);
    }
  }
  for (const directory of ['styles', 'fonts']) {
    for (const source of files(join(root, 'src', directory))) {
      if (source.endsWith('README.md')) continue;
      const target = join(packageDir, source.slice(join(root, 'src').length + 1));
      assert.deepEqual(
        readFileSync(target),
        readFileSync(source),
        `Missing/stale asset: ${target}`,
      );
    }
  }
  for (const [source, target] of [
    ['projects/ui/README.md', 'README.md'],
    ['LICENSE', 'LICENSE'],
    ['projects/ui/icon/LICENSE-lucide.txt', 'LICENSE-lucide.txt'],
  ]) {
    assert.deepEqual(readFileSync(join(packageDir, target)), readFileSync(join(root, source)));
  }
  assert.equal(manifest.exports['./styles.css'].default, './styles/index.css');
  console.log(
    `Package ${manifest.name}@${manifest.version}: ${entries.length} secondary exports and assets verified.`,
  );
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkPackage();
}
