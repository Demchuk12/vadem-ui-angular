import { VdToastStore } from './toast-store';

describe('VdToastStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const options = { max: 3, duration: 1000, exitDuration: 100 };

  it('adds toasts with defaults and auto-dismisses after the duration', () => {
    const store = new VdToastStore(options);
    const id = store.show({ title: 'Збережено' });
    expect(store.snapshot[0]).toMatchObject({
      id,
      variant: 'neutral',
      state: 'open',
      duration: 1000,
    });
    vi.advanceTimersByTime(1000);
    expect(store.snapshot[0].state).toBe('leaving');
    vi.advanceTimersByTime(100);
    expect(store.snapshot).toHaveLength(0);
  });

  it('gives action toasts more time and keeps Infinity toasts', () => {
    const store = new VdToastStore(options);
    store.show({ title: 'A', action: { label: 'Undo', onClick: () => undefined } });
    store.show({ title: 'B', duration: Infinity });
    expect(store.snapshot[0].duration).toBe(2000);
    vi.advanceTimersByTime(10_000);
    expect(store.snapshot.map((t) => t.title)).toEqual(['B']);
  });

  it('pauses and resumes with the remaining time', () => {
    const store = new VdToastStore(options);
    store.show({ title: 'A' });
    vi.advanceTimersByTime(600);
    store.pause();
    vi.advanceTimersByTime(5000);
    expect(store.snapshot[0].state).toBe('open');
    store.resume();
    vi.advanceTimersByTime(399);
    expect(store.snapshot[0].state).toBe('open');
    vi.advanceTimersByTime(1);
    expect(store.snapshot[0].state).toBe('leaving');
  });

  it('caps visible toasts; the oldest leaves first', () => {
    const store = new VdToastStore(options);
    ['1', '2', '3', '4'].forEach((title) => store.show({ title }));
    expect(store.snapshot.filter((t) => t.state === 'open').map((t) => t.title)).toEqual([
      '2',
      '3',
      '4',
    ]);
  });

  it('notifies subscribers and supports manual dismiss/remove', () => {
    const store = new VdToastStore(options);
    const seen: number[] = [];
    store.subscribe((t) => seen.push(t.length));
    const id = store.show({ title: 'A' });
    store.dismiss(id);
    store.remove(id);
    expect(seen).toEqual([0, 1, 1, 0]);
  });
});
