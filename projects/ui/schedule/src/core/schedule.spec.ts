import {
  vdScheduleApplyChange,
  vdScheduleDays,
  vdScheduleItems,
  vdScheduleLayout,
  vdScheduleMinutes,
  vdScheduleMove,
  vdScheduleNormalize,
  vdScheduleOnDay,
  vdScheduleResize,
  vdScheduleSnap,
  vdScheduleStep,
  vdScheduleValid,
} from './schedule';

const timed = (id: string, start: string, end: string) => ({ id, title: id, start, end });

describe('schedule core', () => {
  it('parses wall-clock times and validates events', () => {
    expect(vdScheduleMinutes('1970-01-02T01:30')).toBe(1440 + 90);
    expect(vdScheduleMinutes('2026-02-30T10:00')).toBeNull();
    expect(vdScheduleMinutes('2026-10-21T24:00')).toBeNull();
    expect(vdScheduleValid([timed('a', '2026-10-21T10:00', '2026-10-21T11:00')])).toBe(true);
    expect(vdScheduleValid([timed('a', '2026-10-21T10:00', '2026-10-21T10:00')])).toBe(false);
    expect(
      vdScheduleValid([
        timed('a', '2026-10-21T10:00', '2026-10-21T11:00'),
        timed('a', '2026-10-22T10:00', '2026-10-22T11:00'),
      ]),
    ).toBe(false);
    expect(
      vdScheduleValid([
        { id: 'x', title: 'x', start: '2026-10-21', end: '2026-10-20', allDay: true },
      ]),
    ).toBe(false);
  });

  it('normalizes timed events ending at midnight to the previous day', () => {
    const item = vdScheduleNormalize(timed('a', '2026-10-21T22:00', '2026-10-22T00:00'))!;
    expect(item.startDate).toBe('2026-10-21');
    expect(item.endDate).toBe('2026-10-21');
    const allDay = vdScheduleNormalize({
      id: 'b',
      title: 'b',
      start: '2026-10-21',
      end: '2026-10-23',
      allDay: true,
    })!;
    expect(allDay.endMin - allDay.startMin).toBe(3 * 1440);
  });

  it('finds events per day, all-day first', () => {
    const items = vdScheduleItems([
      timed('late', '2026-10-21T15:00', '2026-10-21T16:00'),
      { id: 'trip', title: 'trip', start: '2026-10-20', end: '2026-10-22', allDay: true },
      timed('night', '2026-10-21T23:00', '2026-10-22T01:00'),
    ]);
    expect(vdScheduleOnDay(items, '2026-10-21').map((i) => i.event.id)).toEqual([
      'trip',
      'late',
      'night',
    ]);
    expect(vdScheduleOnDay(items, '2026-10-22').map((i) => i.event.id)).toEqual(['trip', 'night']);
  });

  it('builds view ranges and steps between periods', () => {
    expect(vdScheduleDays('week', '2026-10-21', 1)[0]).toBe('2026-10-19');
    expect(vdScheduleDays('week', '2026-10-21', 0)[0]).toBe('2026-10-18');
    expect(vdScheduleDays('month', '2026-10-21', 1)).toHaveLength(42);
    expect(vdScheduleDays('agenda', '2026-10-21', 1, 3)).toEqual([
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
    ]);
    expect(vdScheduleStep('month', '2026-01-31', 1)).toBe('2026-02-28');
    expect(vdScheduleStep('week', '2026-10-21', -1)).toBe('2026-10-14');
  });

  it('lays out overlapping events in shared columns and clips to the visible hours', () => {
    const items = vdScheduleItems([
      timed('a', '2026-10-21T09:00', '2026-10-21T11:00'),
      timed('b', '2026-10-21T10:00', '2026-10-21T12:00'),
      timed('c', '2026-10-21T11:00', '2026-10-21T12:00'),
      timed('d', '2026-10-21T14:00', '2026-10-21T15:00'),
      timed('e', '2026-10-21T06:00', '2026-10-21T09:00'),
    ]);
    const layout = vdScheduleLayout(items, '2026-10-21', 8 * 60, 20 * 60);
    const by = Object.fromEntries(layout.map((p) => [p.item.event.id, p]));
    expect(by['a'].column).toBe(0);
    expect(by['b'].column).toBe(1);
    expect(by['c'].column).toBe(0);
    expect(by['a'].columns).toBe(2);
    expect(by['d'].columns).toBe(1);
    expect(by['e'].top).toBe(0);
    expect(by['e'].clippedStart).toBe(true);
    expect(by['d'].top).toBe(6 * 60);
  });

  it('moves, resizes and applies changes immutably', () => {
    const item = vdScheduleNormalize(timed('a', '2026-10-21T10:00', '2026-10-21T11:00'))!;
    expect(vdScheduleMove(item, 1440 + 30)).toEqual({
      id: 'a',
      start: '2026-10-22T10:30',
      end: '2026-10-22T11:30',
      allDay: false,
      kind: 'move',
    });
    expect(vdScheduleResize(item, item.startMin + 5, 15).end).toBe('2026-10-21T10:15');
    const allDay = vdScheduleNormalize({
      id: 'b',
      title: 'b',
      start: '2026-10-21',
      end: '2026-10-22',
      allDay: true,
    })!;
    expect(vdScheduleMove(allDay, -1440)).toMatchObject({ start: '2026-10-20', end: '2026-10-21' });
    expect(vdScheduleSnap(52, 15)).toBe(45);
    const events = [timed('a', '2026-10-21T10:00', '2026-10-21T11:00')];
    const next = vdScheduleApplyChange(events, vdScheduleMove(item, 60));
    expect(next[0].start).toBe('2026-10-21T11:00');
    expect(events[0].start).toBe('2026-10-21T10:00');
    expect(vdScheduleApplyChange(events, { ...vdScheduleMove(item, 0), id: 'zzz' })).toBe(events);
  });
});
