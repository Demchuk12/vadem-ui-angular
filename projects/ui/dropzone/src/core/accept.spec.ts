import { describe, expect, it } from 'vitest';
import { vdAcceptsFile, vdCheckFiles } from './accept';

const file = (name: string, type: string, size = 100) => ({ name, type, size });

describe('vdAcceptsFile', () => {
  it('accepts everything without rules', () => {
    expect(vdAcceptsFile(file('a.exe', ''), '')).toBe(true);
    expect(vdAcceptsFile(file('a.exe', ''), ' , ')).toBe(true);
  });

  it('matches extensions case-insensitively', () => {
    expect(vdAcceptsFile(file('Звіт.PDF', 'application/pdf'), '.pdf')).toBe(true);
    expect(vdAcceptsFile(file('звіт.pdf.exe', ''), '.pdf')).toBe(false);
  });

  it('matches exact and wildcard MIME types', () => {
    expect(vdAcceptsFile(file('a.png', 'image/png'), 'image/png')).toBe(true);
    expect(vdAcceptsFile(file('a.jpg', 'image/jpeg'), 'image/*')).toBe(true);
    expect(vdAcceptsFile(file('a.mp4', 'video/mp4'), 'image/*')).toBe(false);
    expect(vdAcceptsFile(file('a.csv', 'text/csv'), 'image/*, .csv')).toBe(true);
  });
});

describe('vdCheckFiles', () => {
  it('splits by type, size and count, keeping order', () => {
    const files = [
      file('a.png', 'image/png', 10),
      file('b.pdf', 'application/pdf', 10),
      file('c.png', 'image/png', 5000),
      file('d.png', 'image/png', 10),
      file('e.png', 'image/png', 10),
    ];
    const { accepted, rejected } = vdCheckFiles(files, {
      accept: 'image/*',
      maxSize: 1000,
      maxFiles: 2,
    });
    expect(accepted.map((f) => f.name)).toEqual(['a.png', 'd.png']);
    expect(rejected.map((r) => [r.file.name, r.reason])).toEqual([
      ['b.pdf', 'type'],
      ['c.png', 'size'],
      ['e.png', 'count'],
    ]);
  });
});
