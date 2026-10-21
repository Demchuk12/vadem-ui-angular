import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { VdAvatar } from '@vadem/ui/avatar';
import { VdBadge } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VD_CARD } from '@vadem/ui/card';
import { VdCheckbox } from '@vadem/ui/checkbox';
import { VD_DIALOG, VdDialog } from '@vadem/ui/dialog';
import { VdChoice, VdField } from '@vadem/ui/field';
import { VdIcon, VdIconName } from '@vadem/ui/icon';
import { VdInput } from '@vadem/ui/input';
import { VdCombobox, VdOption, VdSelect } from '@vadem/ui/select';
import { VdSwitch } from '@vadem/ui/switch';
import { VD_TABS } from '@vadem/ui/tabs';
import { VdToaster } from '@vadem/ui/toast';
import { map, startWith } from 'rxjs';

const PROFILE = {
  name: 'Олена Коваленко',
  email: 'olena@vadem.dev',
  role: 'Дизайнерка інтерфейсів',
  bio: '',
  language: 'uk',
  timezone: 'Europe/Kyiv',
};

function matchesPassword(group: AbstractControl): ValidationErrors | null {
  const { next, confirm } = group.value as { next: string; confirm: string };
  return confirm && next !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'demo-settings',
  imports: [
    ReactiveFormsModule,
    VD_CARD,
    VD_DIALOG,
    VD_TABS,
    VdAvatar,
    VdBadge,
    VdButton,
    VdCheckbox,
    VdChoice,
    VdCombobox,
    VdField,
    VdIcon,
    VdInput,
    VdOption,
    VdSelect,
    VdSwitch,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="set-head">
      <p class="vd-eyebrow">Акаунт</p>
      <h1>Налаштування</h1>
      <p>Профіль, сповіщення і безпека для olena@vadem.dev.</p>
    </header>

    <vd-tabs [orientation]="wide() ? 'vertical' : 'horizontal'" [(value)]="tab" class="set-tabs">
      <div vdTabList aria-label="Розділи налаштувань">
        <button vdTab value="profile"><vd-icon name="user" />Профіль</button>
        <button vdTab value="notifications"><vd-icon name="bell" />Сповіщення</button>
        <button vdTab value="security"><vd-icon name="shield" />Безпека</button>
        <button vdTab value="billing" disabled><vd-icon name="credit-card" />Оплата</button>
      </div>

      <!-- ------------------------------------------------------------- profile -->
      <div vdTabPanel value="profile">
        <form class="set-pane" [formGroup]="profile" (ngSubmit)="saveProfile()" novalidate>
          <div class="set-pane__head">
            <div>
              <h2>Профіль</h2>
              <p>Так вас бачать учасники робочого простору.</p>
            </div>
            @if (dirty()) {
              <span vdBadge variant="warning" dot>Незбережені зміни</span>
            }
          </div>

          <div class="set-avatar">
            <vd-avatar size="xl" name="Олена Коваленко" decorative />
            <div class="set-avatar__text">
              <p class="set-strong">Фото профілю</p>
              <p class="set-muted">PNG або JPG, квадратне, до 2 МБ.</p>
            </div>
            <div class="set-avatar__actions">
              <button vdButton size="sm" type="button">Завантажити</button>
              <button vdButton size="sm" variant="ghost" type="button">Видалити</button>
            </div>
          </div>

          <div class="set-grid">
            <vd-field label="Імʼя" error="Вкажіть імʼя">
              <input vdInput formControlName="name" autocomplete="name" />
            </vd-field>
            <vd-field label="Email" hint="Для входу і сповіщень" error="Вкажіть коректний email">
              <input vdInput type="email" formControlName="email" autocomplete="email" />
            </vd-field>
            <vd-field label="Посада" hint="Необовʼязково">
              <input vdInput formControlName="role" autocomplete="organization-title" />
            </vd-field>
            <vd-field label="Мова інтерфейсу">
              <vd-select formControlName="language">
                <vd-option value="uk">Українська</vd-option>
                <vd-option value="en">English</vd-option>
                <vd-option value="pl">Polski</vd-option>
                <vd-option value="de">Deutsch</vd-option>
              </vd-select>
            </vd-field>
            <vd-field label="Часовий пояс" hint="Для звітів і розкладу розгортань" class="set-span">
              <vd-combobox
                formControlName="timezone"
                placeholder="Пошук міста або UTC"
                emptyText="Такого часового поясу немає"
              >
                @for (tz of timezones; track tz.value) {
                  <vd-option [value]="tz.value">{{ tz.label }}</vd-option>
                }
              </vd-combobox>
            </vd-field>
            <vd-field label="Про себе" hint="До 280 символів, видно в профілі" class="set-span">
              <textarea
                vdInput
                formControlName="bio"
                maxlength="280"
                placeholder="Над чим працюєте, як з вами краще звʼязатися"
              ></textarea>
            </vd-field>
          </div>

          <footer class="set-actions">
            <button
              vdButton
              variant="ghost"
              type="button"
              [disabled]="!dirty()"
              (click)="resetProfile()"
            >
              Скасувати
            </button>
            <button
              vdButton
              variant="primary"
              type="submit"
              [disabled]="!dirty()"
              [loading]="saving()"
            >
              Зберегти зміни
            </button>
          </footer>
        </form>
      </div>

      <!-- -------------------------------------------------------- notifications -->
      <div vdTabPanel value="notifications">
        <div class="set-pane">
          <div class="set-pane__head">
            <div>
              <h2>Сповіщення</h2>
              <p>Перемикачі діють одразу, без збереження.</p>
            </div>
          </div>

          <section class="set-group" aria-labelledby="notify-events">
            <h3 id="notify-events" class="vd-eyebrow">Події</h3>
            @for (n of notifications; track n.title) {
              <vd-field [hint]="n.hint">
                <label vdChoice class="set-toggle">
                  <span class="set-strong">{{ n.title }}</span>
                  <input
                    type="checkbox"
                    vdSwitch
                    [checked]="n.on"
                    (change)="notify(n.title, $any($event.target).checked)"
                  />
                </label>
              </vd-field>
            }
          </section>

          <fieldset class="set-group">
            <legend class="vd-eyebrow">Канали</legend>
            <div class="set-channels">
              <label vdChoice><input type="checkbox" vdCheckbox checked />Email</label>
              <label vdChoice><input type="checkbox" vdCheckbox checked />Push у браузері</label>
              <label vdChoice><input type="checkbox" vdCheckbox />Telegram</label>
              <label vdChoice
                ><input type="checkbox" vdCheckbox disabled />SMS (план Business)</label
              >
            </div>
          </fieldset>

          <section class="set-group" aria-labelledby="notify-digest">
            <h3 id="notify-digest" class="vd-eyebrow">Дайджест</h3>
            <vd-field label="Як часто надсилати зведення" class="set-narrow">
              <vd-select value="weekly">
                <vd-option value="daily">Щодня о 9:00</vd-option>
                <vd-option value="weekly">Щопонеділка</vd-option>
                <vd-option value="monthly">Першого числа місяця</vd-option>
                <vd-option value="never">Не надсилати</vd-option>
              </vd-select>
            </vd-field>
          </section>
        </div>
      </div>

      <!-- ------------------------------------------------------------ security -->
      <div vdTabPanel value="security">
        <div class="set-pane">
          <div class="set-pane__head">
            <div>
              <h2>Безпека</h2>
              <p>Пароль, двофакторна автентифікація і сесії.</p>
            </div>
          </div>

          <div class="set-list">
            <div class="set-list__row">
              <span class="set-list__icon"><vd-icon name="lock" /></span>
              <div class="set-list__text">
                <p class="set-strong">Пароль</p>
                <p class="set-muted">Змінено 3 місяці тому</p>
              </div>
              <button vdButton size="sm" (click)="passwordDialog.show()">Змінити</button>
            </div>
            <div class="set-list__row">
              <span class="set-list__icon"><vd-icon name="shield" /></span>
              <div class="set-list__text">
                <p class="set-strong" id="mfa-label">Двофакторна автентифікація</p>
                <p class="set-muted" id="mfa-hint">
                  Код із застосунку-автентифікатора під час входу.
                </p>
              </div>
              <span vdBadge [variant]="mfa() ? 'success' : 'warning'" dot>{{
                mfa() ? 'Увімкнено' : 'Вимкнено'
              }}</span>
              <input
                type="checkbox"
                vdSwitch
                aria-labelledby="mfa-label"
                aria-describedby="mfa-hint"
                [checked]="mfa()"
                (change)="toggleMfa($any($event.target).checked)"
              />
            </div>
          </div>

          <section class="set-group" aria-labelledby="sessions">
            <h3 id="sessions" class="vd-eyebrow">Активні сесії</h3>
            <ul class="set-list" role="list">
              @for (s of sessions(); track s.id) {
                <li class="set-list__row">
                  <span class="set-list__icon"><vd-icon [name]="s.icon" /></span>
                  <div class="set-list__text">
                    <p class="set-strong">
                      {{ s.device }}
                      @if (s.current) {
                        <span vdBadge variant="accent">Ця сесія</span>
                      }
                    </p>
                    <p class="set-muted">{{ s.place }} · {{ s.seen }}</p>
                  </div>
                  @if (!s.current) {
                    <button
                      vdButton
                      size="sm"
                      variant="ghost"
                      (click)="endSession(s.id)"
                      [attr.aria-label]="'Завершити сесію: ' + s.device"
                    >
                      Завершити
                    </button>
                  }
                </li>
              }
            </ul>
          </section>

          <article vdCard class="set-danger">
            <header vdCardHeader>
              <h3 vdCardTitle>Видалити акаунт</h3>
              <p vdCardDescription>
                Профіль, ключі API і членство в командах буде видалено назавжди. Проєкти, де ви
                єдиний власник, теж зникнуть.
              </p>
            </header>
            <footer vdCardFooter>
              <button vdButton variant="danger" (click)="deleteDialog.show()">
                <vd-icon name="trash" slot="start" />Видалити акаунт
              </button>
            </footer>
          </article>
        </div>
      </div>

      <div vdTabPanel value="billing"></div>
    </vd-tabs>

    <!-- --------------------------------------------------------------- dialogs -->
    <dialog vdDialog #passwordDialog="vdDialog" (closed)="passwordForm.reset()">
      <form [formGroup]="passwordForm" (ngSubmit)="changePassword(passwordDialog)" novalidate>
        <header vdDialogHeader>
          <h2 vdDialogTitle>Змінити пароль</h2>
          <p vdDialogDescription>Після зміни інші сесії завершаться.</p>
          <button
            vdButton
            vdDialogClose
            variant="ghost"
            iconOnly
            size="sm"
            aria-label="Закрити"
            type="button"
          >
            <vd-icon name="x" />
          </button>
        </header>
        <div vdDialogBody>
          <vd-field label="Поточний пароль" error="Вкажіть поточний пароль">
            <input
              vdInput
              type="password"
              formControlName="current"
              autocomplete="current-password"
              autofocus
            />
          </vd-field>
          <vd-field
            label="Новий пароль"
            hint="Щонайменше 12 символів"
            error="Щонайменше 12 символів"
          >
            <input vdInput type="password" formControlName="next" autocomplete="new-password" />
          </vd-field>
          <vd-field label="Повторіть новий пароль" [error]="confirmError()">
            <input
              vdInput
              type="password"
              formControlName="confirm"
              autocomplete="new-password"
              [invalid]="mismatch()"
              [touched]="confirmTouched()"
            />
          </vd-field>
        </div>
        <footer vdDialogFooter>
          <button vdButton variant="ghost" vdDialogClose type="button">Скасувати</button>
          <button vdButton variant="primary" type="submit">Змінити пароль</button>
        </footer>
      </form>
    </dialog>

    <dialog
      vdDialog
      #deleteDialog="vdDialog"
      size="sm"
      role="alertdialog"
      [dismissible]="false"
      (closed)="deleteConfirm.reset()"
    >
      <header vdDialogHeader>
        <h2 vdDialogTitle>Видалити акаунт назавжди?</h2>
        <p vdDialogDescription>Цю дію не можна скасувати. Щоб підтвердити, введіть ВИДАЛИТИ.</p>
      </header>
      <div vdDialogBody>
        <vd-field label="Підтвердження">
          <input vdInput [formControl]="deleteConfirm" autocomplete="off" spellcheck="false" />
        </vd-field>
      </div>
      <footer vdDialogFooter>
        <button vdButton vdDialogClose autofocus>Залишити акаунт</button>
        <button
          vdButton
          variant="danger"
          [disabled]="deleteText() !== 'ВИДАЛИТИ'"
          (click)="deleteAccount(deleteDialog)"
        >
          Видалити
        </button>
      </footer>
    </dialog>
  `,
  styleUrl: './settings.css',
})
export default class SettingsScreen {
  private readonly toaster = inject(VdToaster);

  protected readonly tab = signal('profile');
  protected readonly wide = signal(true);
  protected readonly saving = signal(false);
  protected readonly mfa = signal(false);

  protected readonly profile = new FormGroup({
    name: new FormControl(PROFILE.name, { nonNullable: true, validators: Validators.required }),
    email: new FormControl(PROFILE.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl(PROFILE.role, { nonNullable: true }),
    bio: new FormControl(PROFILE.bio, { nonNullable: true }),
    language: new FormControl<string | null>(PROFILE.language),
    timezone: new FormControl<string | null>(PROFILE.timezone),
  });

  protected readonly dirty = toSignal(
    this.profile.valueChanges.pipe(
      startWith(null),
      map(() => this.profile.dirty),
    ),
    { initialValue: false },
  );

  protected readonly passwordForm = new FormGroup(
    {
      current: new FormControl('', { nonNullable: true, validators: Validators.required }),
      next: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(12)],
      }),
      confirm: new FormControl('', { nonNullable: true, validators: Validators.required }),
    },
    { validators: matchesPassword },
  );

  private readonly passwordStatus = toSignal(this.passwordForm.events, { initialValue: null });
  /** Group-level error shown on the confirm field once it was touched. */
  protected readonly mismatch = computed(
    () => (this.passwordStatus(), this.passwordForm.hasError('mismatch')),
  );
  protected readonly confirmError = computed(() =>
    this.mismatch() ? 'Паролі не збігаються' : 'Повторіть новий пароль',
  );
  protected readonly confirmTouched = computed(
    () => (this.passwordStatus(), this.passwordForm.controls.confirm.touched),
  );

  protected readonly deleteConfirm = new FormControl('', { nonNullable: true });
  protected readonly deleteText = toSignal(this.deleteConfirm.valueChanges, { initialValue: '' });

  protected readonly timezones = [
    { value: 'Europe/Kyiv', label: 'Київ (UTC+2, літній UTC+3)' },
    { value: 'Europe/Warsaw', label: 'Варшава (UTC+1)' },
    { value: 'Europe/Berlin', label: 'Берлін (UTC+1)' },
    { value: 'Europe/London', label: 'Лондон (UTC+0)' },
    { value: 'Europe/Lisbon', label: 'Лісабон (UTC+0)' },
    { value: 'America/New_York', label: 'Нью-Йорк (UTC−5)' },
    { value: 'America/Los_Angeles', label: 'Лос-Анджелес (UTC−8)' },
    { value: 'Asia/Tokyo', label: 'Токіо (UTC+9)' },
    { value: 'UTC', label: 'UTC' },
  ];

  protected readonly notifications = [
    { title: 'Невдалі розгортання', hint: 'Одразу, щойно збірка або перевірка впала.', on: true },
    { title: 'Запрошення до команд', hint: 'Коли вас додають до проєкту чи команди.', on: true },
    { title: 'Ліміти використання', hint: 'На 80% і 100% місячної квоти.', on: true },
    { title: 'Новини продукту', hint: 'Не частіше ніж раз на місяць.', on: false },
  ];

  protected readonly sessions = signal<
    {
      id: string;
      device: string;
      place: string;
      seen: string;
      icon: VdIconName;
      current?: boolean;
    }[]
  >([
    {
      id: 's1',
      device: 'Firefox · Linux',
      place: 'Київ, Україна',
      seen: 'зараз',
      icon: 'monitor',
      current: true,
    },
    {
      id: 's2',
      device: 'Safari · iPhone',
      place: 'Львів, Україна',
      seen: '2 години тому',
      icon: 'user',
    },
    {
      id: 's3',
      device: 'Chrome · Windows',
      place: 'Варшава, Польща',
      seen: '5 днів тому',
      icon: 'globe',
    },
  ]);

  constructor() {
    // Vertical tabs need room; on narrow screens they become a horizontal, scrolling strip.
    const media = inject(DOCUMENT).defaultView?.matchMedia('(width >= 48rem)');
    if (media) {
      const sync = () => this.wide.set(media.matches);
      sync();
      media.addEventListener('change', sync);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', sync));
    }
  }

  protected saveProfile(): void {
    this.profile.markAllAsTouched();
    if (this.profile.invalid) return;
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.profile.markAsPristine();
      this.profile.updateValueAndValidity();
      this.toaster.success('Профіль збережено', 'Зміни вже бачать учасники команди.');
    }, 800);
  }

  protected resetProfile(): void {
    this.profile.reset(PROFILE);
  }

  protected notify(title: string, on: boolean): void {
    this.toaster.show({ title: `«${title}»: ${on ? 'увімкнено' : 'вимкнено'}` });
  }

  protected toggleMfa(on: boolean): void {
    this.mfa.set(on);
    if (on) this.toaster.success('2FA увімкнено', 'Під час наступного входу знадобиться код.');
    else
      this.toaster.show({
        variant: 'warning',
        title: '2FA вимкнено',
        description: 'Акаунт захищений лише паролем.',
      });
  }

  protected endSession(id: string): void {
    const s = this.sessions().find((x) => x.id === id);
    this.sessions.update((list) => list.filter((x) => x.id !== id));
    this.toaster.show({ title: 'Сесію завершено', description: s?.device });
  }

  protected changePassword(dialog: VdDialog): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    dialog.close('changed');
    this.toaster.success('Пароль змінено', 'Інші сесії завершено.');
  }

  protected deleteAccount(dialog: VdDialog): void {
    dialog.close('deleted');
    this.toaster.show({
      variant: 'info',
      title: 'Це демо',
      description: 'Акаунт нікуди не подівся.',
    });
  }
}
