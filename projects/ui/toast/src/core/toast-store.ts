/**
 * Framework-agnostic toast queue: ids, auto-dismiss timers that pause while the user is
 * interacting (hover/focus), a cap on visible toasts, and a two-phase exit ("leaving" for the
 * exit animation, then removed). Adapters subscribe and render.
 */

export type VdToastVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface VdToastAction {
  label: string;
  onClick: () => void;
}

export interface VdToastInput {
  title: string;
  description?: string;
  variant?: VdToastVariant;
  action?: VdToastAction;
  /** Auto-dismiss after ms. `Infinity` keeps it until dismissed. Default depends on content. */
  duration?: number;
}

export interface VdToast extends Required<Pick<VdToastInput, 'title' | 'variant'>> {
  id: number;
  description?: string;
  action?: VdToastAction;
  duration: number;
  state: 'open' | 'leaving';
}

export interface VdToastStoreOptions {
  /** Max toasts shown at once; older ones leave first. */
  max: number;
  /** Default lifetime, ms. Toasts with an action get double, giving time to reach it. */
  duration: number;
  /** How long the exit animation may take before removal, ms. */
  exitDuration: number;
}

export const VD_TOAST_DEFAULTS: VdToastStoreOptions = { max: 3, duration: 5000, exitDuration: 300 };

interface Timer {
  handle?: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
}

export class VdToastStore {
  private toasts: VdToast[] = [];
  private readonly timers = new Map<number, Timer>();
  private readonly listeners = new Set<(toasts: readonly VdToast[]) => void>();
  private nextId = 1;
  private paused = false;

  constructor(private readonly options: VdToastStoreOptions = VD_TOAST_DEFAULTS) {}

  get snapshot(): readonly VdToast[] {
    return this.toasts;
  }

  subscribe(listener: (toasts: readonly VdToast[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => this.listeners.delete(listener);
  }

  show(input: VdToastInput): number {
    const id = this.nextId++;
    const duration =
      input.duration ?? (input.action ? this.options.duration * 2 : this.options.duration);
    const toast: VdToast = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? 'neutral',
      action: input.action,
      duration,
      state: 'open',
    };
    this.toasts = [...this.toasts, toast];
    this.startTimer(id, duration);

    const open = this.toasts.filter((t) => t.state === 'open');
    for (const extra of open.slice(0, Math.max(0, open.length - this.options.max))) {
      this.dismiss(extra.id);
    }
    this.emit();
    return id;
  }

  /** Starts the exit; the toast is removed after the exit animation (or `exitDuration`). */
  dismiss(id: number): void {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || toast.state === 'leaving') return;
    this.clearTimer(id);
    this.toasts = this.toasts.map((t) => (t.id === id ? { ...t, state: 'leaving' } : t));
    this.emit();
    setTimeout(() => this.remove(id), this.options.exitDuration);
  }

  /** Removes immediately (call when the exit animation has ended). */
  remove(id: number): void {
    if (!this.toasts.some((t) => t.id === id)) return;
    this.clearTimer(id);
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.emit();
  }

  dismissAll(): void {
    for (const t of this.toasts) this.dismiss(t.id);
  }

  /** Pause every timer (pointer or focus inside the toaster - WCAG 2.2.1). */
  pause(): void {
    if (this.paused) return;
    this.paused = true;
    const now = Date.now();
    for (const timer of this.timers.values()) {
      clearTimeout(timer.handle);
      timer.handle = undefined;
      timer.remaining -= now - timer.startedAt;
    }
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const [id, timer] of this.timers) this.run(id, timer);
  }

  destroy(): void {
    for (const id of [...this.timers.keys()]) this.clearTimer(id);
    this.listeners.clear();
  }

  private startTimer(id: number, duration: number): void {
    if (!Number.isFinite(duration)) return;
    const timer: Timer = { remaining: duration, startedAt: Date.now() };
    this.timers.set(id, timer);
    if (!this.paused) this.run(id, timer);
  }

  private run(id: number, timer: Timer): void {
    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => this.dismiss(id), Math.max(0, timer.remaining));
  }

  private clearTimer(id: number): void {
    clearTimeout(this.timers.get(id)?.handle);
    this.timers.delete(id);
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.toasts);
  }
}
