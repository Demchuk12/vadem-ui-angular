// Build and exercise a fresh application installed from the real npm tarball.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { checkPackage, root } from './check-package.mjs';

const workspace = mkdtempSync(join(tmpdir(), 'vadem-consumer-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const run = (command, args, cwd = workspace) =>
  execFileSync(command, args, { cwd, stdio: 'inherit' });
let server;
let browser;
let succeeded = false;

try {
  const manifest = await checkPackage();
  const [packed] = JSON.parse(
    execFileSync(
      npm,
      [
        'pack',
        join(root, 'dist/ui'),
        '--ignore-scripts',
        '--json',
        '--pack-destination',
        workspace,
      ],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
    ),
  );
  cpSync(join(root, 'tools/consumer'), workspace, { recursive: true });
  cpSync(join(root, 'docs/examples/profile-form.ts'), join(workspace, 'src/profile-form.ts'));

  const dependencies = { '@vadem/ui': `file:./${packed.filename}` };
  const devDependencies = {};
  for (const name of [
    '@angular/common',
    '@angular/compiler',
    '@angular/core',
    '@angular/forms',
    '@angular/platform-browser',
    'rxjs',
    'tslib',
  ]) {
    dependencies[name] = JSON.parse(
      readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8'),
    ).version;
  }
  for (const name of ['@angular/build', '@angular/cli', '@angular/compiler-cli', 'typescript']) {
    devDependencies[name] = JSON.parse(
      readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8'),
    ).version;
  }
  writeFileSync(
    join(workspace, 'package.json'),
    JSON.stringify(
      {
        name: 'vadem-package-consumer',
        version: '0.0.0',
        private: true,
        dependencies,
        devDependencies,
      },
      null,
      2,
    ),
  );
  run(npm, ['install', '--ignore-scripts', '--strict-peer-deps', '--no-audit', '--no-fund']);
  const installed = join(workspace, 'node_modules/@vadem/ui');
  assert.equal(
    lstatSync(installed).isSymbolicLink(),
    false,
    'The library must be installed, not linked.',
  );
  await checkPackage(installed);
  const imports = Object.keys(manifest.exports).filter(
    (key) => key === '.' || (manifest.exports[key].types && !key.includes('*')),
  );
  writeFileSync(
    join(workspace, 'src/entry-points.ts'),
    imports
      .map(
        (key, index) =>
          `export type Entry${index} = typeof import('${key === '.' ? '@vadem/ui' : '@vadem/ui/' + key.slice(2)}');`,
      )
      .join('\n'),
  );
  // Use only the consumer's installed CLI, builder, declarations, and runtime packages.
  run(process.execPath, [
    join(workspace, 'node_modules/@angular/cli/bin/ng.js'),
    'build',
    'consumer',
  ]);

  const output = join(workspace, 'dist/browser');
  const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.woff2': 'font/woff2',
  };
  server = createServer((request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const target = resolve(output, `.${path === '/' ? '/index.html' : path}`);
      if (!target.startsWith(output + sep)) {
        response.writeHead(403).end();
        return;
      }
      response.setHeader('Content-Type', mime[extname(target)] ?? 'application/octet-stream');
      response.end(readFileSync(target));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', accept);
  });
  browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const fonts = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (new URL(response.url()).pathname.endsWith('.woff2')) fonts.push(response.status());
  });
  const screenshots = join(root, 'screenshots/package-consumer');
  mkdirSync(screenshots, { recursive: true });
  for (const theme of ['dark', 'light']) {
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(
      (theme) => document.documentElement.setAttribute('data-theme', theme),
      theme,
    );
    await expect(page.getByTestId('version')).toHaveText(manifest.version);
    const save = page.getByRole('button', { name: 'Зберегти', exact: true });
    const name = page.getByRole('textbox', { name: 'Ім’я', exact: true });
    const email = page.getByRole('textbox', { name: 'Електронна пошта', exact: true });
    await save.click();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await name.fill('Олена');
    await email.fill('olena@example.test');
    await save.press('Enter');
    await expect(page.getByRole('status')).toHaveText(
      'Форму перевірено. Приклад не надсилає дані на сервер.',
    );
    await expect(name).not.toHaveAttribute('aria-invalid', 'true');
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
    assert.ok(
      await save.evaluate((button) =>
        getComputedStyle(button).getPropertyValue('--vd-button-bg').trim(),
      ),
      'Package CSS did not load.',
    );
    await page.evaluate(() => document.fonts.ready);
    assert.ok(
      await page.evaluate(() => document.fonts.check('16px Manrope', 'Олена')),
      'Bundled font did not load.',
    );
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    assert.deepEqual(
      axe.violations.map((issue) => issue.id),
      [],
      `Consumer axe failures (${theme}).`,
    );
    await page.screenshot({ path: join(screenshots, `${theme}.png`), fullPage: true });
  }
  assert.ok(fonts.length >= 2, 'Expected bundled Latin and Cyrillic font requests.');
  assert.ok(
    fonts.every((status) => status === 200),
    'A bundled font request failed.',
  );
  assert.deepEqual(errors, [], 'Consumer browser errors.');
  console.log(
    `Independent consumer passed: ${imports.length} typed entry points, production build, forms, CSS/fonts, dark/light and axe.`,
  );
  succeeded = true;
} finally {
  await browser?.close();
  if (server) await new Promise((accept) => server.close(accept));
  if (succeeded) rmSync(workspace, { recursive: true, force: true });
  else console.error(`Consumer failure evidence retained at ${workspace}`);
}
