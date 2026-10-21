import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VdAlert, VdAlertTitle } from '@vadem/ui/alert';
import { VdAlertDialog } from '@vadem/ui/alert-dialog';
import { VdAvatar } from '@vadem/ui/avatar';
import { VdBadge, VdBadgeVariant } from '@vadem/ui/badge';
import { VdButton } from '@vadem/ui/button';
import { VdCard } from '@vadem/ui/card';
import { VD_DIALOG, VdDialog } from '@vadem/ui/dialog';
import { VD_EMPTY_STATE } from '@vadem/ui/empty-state';
import { VdField } from '@vadem/ui/field';
import { VdIcon } from '@vadem/ui/icon';
import { VdInput, VdInputGroup } from '@vadem/ui/input';
import { VdPagination } from '@vadem/ui/pagination';
import { VdOption, VdSelect } from '@vadem/ui/select';
import { VdSkeleton } from '@vadem/ui/skeleton';
import { VD_TABLE, VdSort, vdSortRows } from '@vadem/ui/table';
import { VdToaster } from '@vadem/ui/toast';

type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface Member {
  id: number;
  name: string;
  email: string;
  role: Role;
}

const ROLES: { value: Role; label: string; variant: VdBadgeVariant }[] = [
  { value: 'owner', label: 'Власник', variant: 'accent' },
  { value: 'admin', label: 'Адміністратор', variant: 'info' },
  { value: 'member', label: 'Учасник', variant: 'neutral' },
  { value: 'viewer', label: 'Спостерігач', variant: 'neutral' },
];

const SEED: Member[] = [
  { id: 1, name: 'Олена Коваленко', email: 'olena@vadem.dev', role: 'owner' },
  { id: 2, name: 'Іван Шевченко', email: 'ivan@vadem.dev', role: 'admin' },
  { id: 3, name: 'Євгенія Мельник', email: 'yevheniia@vadem.dev', role: 'member' },
  { id: 4, name: 'Богдан Ткаченко', email: 'bohdan@vadem.dev', role: 'member' },
  { id: 5, name: 'Ірина Бондаренко', email: 'iryna@vadem.dev', role: 'viewer' },
  { id: 6, name: 'Андрій Кравченко', email: 'andrii@vadem.dev', role: 'member' },
];

const PAGE_SIZE = 4;

/** A pretend backend: every call is async and can be told to fail once. */
class MembersApi {
  private rows = SEED.map((m) => ({ ...m }));
  private nextId = SEED.length + 1;
  failNext = false;

  private call<T>(work: () => T): Promise<T> {
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (this.failNext) {
          this.failNext = false;
          reject(new Error('Сервер недоступний'));
          return;
        }
        try {
          resolve(work());
        } catch (error) {
          reject(error);
        }
      }, 400),
    );
  }

  list(): Promise<Member[]> {
    return this.call(() => this.rows.map((m) => ({ ...m })));
  }

  save(member: Omit<Member, 'id'> & { id?: number }): Promise<Member> {
    return this.call(() => {
      const duplicate = this.rows.some(
        (m) => m.email.toLowerCase() === member.email.toLowerCase() && m.id !== member.id,
      );
      if (duplicate) throw new Error('duplicate');
      if (member.id) {
        const i = this.rows.findIndex((m) => m.id === member.id);
        this.rows[i] = { ...this.rows[i], ...member, id: member.id };
        return { ...this.rows[i] };
      }
      const created = { ...member, id: this.nextId++ };
      this.rows.push(created);
      return { ...created };
    });
  }

  remove(id: number): Promise<void> {
    return this.call(() => {
      this.rows = this.rows.filter((m) => m.id !== id);
    });
  }
}

/**
 * Admin workflow built only from library components: list with search/sort/pages, create and
 * edit in a modal form with validation and a server error, confirmed delete, and
 * loading/error/empty feedback. The backend is simulated.
 */
@Component({
  selector: 'demo-members',
  imports: [
    ReactiveFormsModule,
    VdAlert,
    VdAlertTitle,
    VdAlertDialog,
    VdAvatar,
    VdBadge,
    VdButton,
    VdCard,
    VdField,
    VdIcon,
    VdInput,
    VdInputGroup,
    VdOption,
    VdPagination,
    VdSelect,
    VdSkeleton,
    VD_DIALOG,
    VD_EMPTY_STATE,
    VD_TABLE,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './members.css',
  template: `
    <header class="mem-head">
      <p class="vd-eyebrow">Vadem Cloud / Команда</p>
      <h1>Учасники</h1>
      <p>Запросіть людей у робочий простір і керуйте їхніми ролями.</p>
    </header>

    <div class="mem-toolbar">
      <vd-input-group class="mem-search">
        <vd-icon name="search" slot="start" />
        <input
          vdInput
          type="search"
          size="sm"
          placeholder="Імʼя або email"
          aria-label="Пошук учасників"
          [value]="query()"
          (input)="setQuery($any($event.target).value)"
        />
      </vd-input-group>
      <button vdButton variant="primary" size="sm" (click)="openCreate()">
        <vd-icon name="plus" slot="start" />Додати учасника
      </button>
      <button vdButton variant="secondary" size="sm" (click)="load()">Оновити</button>
      <button vdButton variant="ghost" size="sm" (click)="simulateFailure()">
        Симулювати збій
      </button>
    </div>

    @switch (status()) {
      @case ('loading') {
        <div vdCard class="mem-skeleton" role="status" aria-label="Завантаження учасників">
          @for (n of [1, 2, 3, 4]; track n) {
            <div class="mem-skeleton__row">
              <span vdSkeleton shape="circle"></span>
              <span vdSkeleton shape="text"></span>
            </div>
          }
        </div>
      }
      @case ('error') {
        <div vdAlert variant="danger" layout="banner">
          <p vdAlertTitle>Не вдалося завантажити учасників</p>
          <p>Перевірте зʼєднання та спробуйте ще раз.</p>
          <button vdButton size="sm" (click)="load()">Спробувати знову</button>
        </div>
      }
      @default {
        @if (rows().length === 0 && !query()) {
          <div vdCard>
            <div vdEmptyState icon="user">
              <h2 vdEmptyStateTitle>У команді ще нікого немає</h2>
              <p vdEmptyStateDescription>Запросіть першого учасника, щоб почати спільну роботу.</p>
              <div slot="actions">
                <button vdButton variant="primary" size="sm" (click)="openCreate()">
                  Додати учасника
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div vdCard>
            <div vdTableScroll aria-label="Учасники">
              <table vdTable [(sort)]="sort">
                <thead>
                  <tr>
                    <th scope="col" vdSortHeader="name">Імʼя</th>
                    <th scope="col" vdSortHeader="email">Email</th>
                    <th scope="col" vdSortHeader="role">Роль</th>
                    <th scope="col"><span class="vd-visually-hidden">Дії</span></th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of pageRows(); track m.id) {
                    <tr vdRow>
                      <th scope="row">
                        <span class="mem-person">
                          <vd-avatar size="sm" [name]="m.name" decorative />{{ m.name }}
                        </span>
                      </th>
                      <td>{{ m.email }}</td>
                      <td>
                        <span vdBadge [variant]="roleOf(m.role).variant">{{
                          roleOf(m.role).label
                        }}</span>
                      </td>
                      <td class="mem-actions">
                        <button
                          vdButton
                          variant="ghost"
                          size="sm"
                          iconOnly
                          [attr.aria-label]="'Редагувати ' + m.name"
                          (click)="openEdit(m)"
                        >
                          <vd-icon name="pencil" />
                        </button>
                        <button
                          vdButton
                          variant="ghost"
                          size="sm"
                          iconOnly
                          [attr.aria-label]="'Видалити ' + m.name"
                          (click)="askDelete(m)"
                        >
                          <vd-icon name="trash" />
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td vdTableEmpty colspan="4">
                        <div vdEmptyState icon="search" size="sm">
                          <p vdEmptyStateTitle>Нікого не знайдено</p>
                          <p vdEmptyStateDescription>Немає учасників за запитом «{{ query() }}».</p>
                          <div slot="actions">
                            <button vdButton size="sm" (click)="setQuery('')">Скинути пошук</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
          @if (pageCount() > 1) {
            <div class="mem-footer">
              <vd-pagination
                size="sm"
                label="Сторінки учасників"
                previousLabel="Попередня сторінка"
                nextLabel="Наступна сторінка"
                [pageLabel]="pageLabel"
                [pageCount]="pageCount()"
                [(page)]="page"
              />
            </div>
          }
        }
      }
    }

    <dialog vdDialog #editor="vdDialog" size="sm" (closed)="resetForm()">
      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <header vdDialogHeader>
          <h2 vdDialogTitle>{{ editing() ? 'Редагувати учасника' : 'Новий учасник' }}</h2>
          <p vdDialogDescription>Роль визначає, що учасник може змінювати в просторі.</p>
        </header>
        <div vdDialogBody>
          @if (formError()) {
            <div vdAlert variant="danger" role="alert">
              <p>{{ formError() }}</p>
            </div>
          }
          <vd-field label="Імʼя" error="Вкажіть імʼя">
            <input vdInput formControlName="name" autocomplete="off" />
          </vd-field>
          <vd-field label="Email" error="Вкажіть коректний email">
            <input vdInput type="email" formControlName="email" autocomplete="off" />
          </vd-field>
          <vd-field label="Роль">
            <vd-select formControlName="role">
              @for (r of roles; track r.value) {
                <vd-option [value]="r.value">{{ r.label }}</vd-option>
              }
            </vd-select>
          </vd-field>
        </div>
        <footer vdDialogFooter>
          <button vdButton variant="ghost" type="button" vdDialogClose [disabled]="saving()">
            Скасувати
          </button>
          <button vdButton variant="primary" type="submit" [loading]="saving()">Зберегти</button>
        </footer>
      </form>
    </dialog>

    <vd-alert-dialog
      [(open)]="confirmOpen"
      [title]="'Видалити ' + (target()?.name ?? '') + '?'"
      description="Учасник одразу втратить доступ до робочого простору."
      confirmLabel="Видалити"
      [action]="remove"
    />
  `,
})
export default class MembersScreen {
  private readonly toaster = inject(VdToaster);
  private readonly api = new MembersApi();

  protected readonly roles = ROLES;
  protected readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  protected readonly members = signal<Member[]>([]);
  protected readonly query = signal('');
  protected readonly page = signal(1);
  protected readonly sort = signal<VdSort | null>({ key: 'name', direction: 'ascending' });

  protected readonly editing = signal<Member | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly target = signal<Member | null>(null);
  protected readonly confirmOpen = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl<Role>('member', { nonNullable: true }),
  });

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const filtered = q
      ? this.members().filter(
          (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
        )
      : this.members();
    return vdSortRows(filtered, this.sort(), { locale: 'uk' });
  });
  protected readonly pageCount = computed(() => Math.ceil(this.rows().length / PAGE_SIZE));
  protected readonly pageRows = computed(() => {
    const start = (Math.min(this.page(), Math.max(this.pageCount(), 1)) - 1) * PAGE_SIZE;
    return this.rows().slice(start, start + PAGE_SIZE);
  });
  protected readonly pageLabel = (page: number) => `Сторінка ${page}`;

  private readonly editor = viewChild.required(VdDialog);

  constructor() {
    void this.load();
  }

  protected roleOf(role: Role) {
    return ROLES.find((r) => r.value === role) ?? ROLES[2];
  }

  protected async load(): Promise<void> {
    this.status.set('loading');
    try {
      this.members.set(await this.api.list());
      this.status.set('ready');
    } catch {
      this.status.set('error');
    }
  }

  protected setQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  protected simulateFailure(): void {
    this.api.failNext = true;
    this.toaster.show({
      title: 'Наступний запит завершиться помилкою',
      variant: 'warning',
      duration: 2500,
    });
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.resetForm();
    this.openEditor();
  }

  protected openEdit(member: Member): void {
    this.editing.set(member);
    this.form.reset({ name: member.name, email: member.email, role: member.role });
    this.formError.set('');
    this.openEditor();
  }

  protected resetForm(): void {
    if (!this.editing()) this.form.reset({ name: '', email: '', role: 'member' });
    this.formError.set('');
    this.saving.set(false);
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.formError.set('');
    const value = this.form.getRawValue();
    try {
      const saved = await this.api.save({ ...value, id: this.editing()?.id });
      this.members.update((list) =>
        this.editing() ? list.map((m) => (m.id === saved.id ? saved : m)) : [...list, saved],
      );
      this.toaster.success(this.editing() ? 'Зміни збережено' : 'Учасника додано', saved.name);
      this.closeEditor();
    } catch (error) {
      this.formError.set(
        error instanceof Error && error.message === 'duplicate'
          ? 'Учасник з таким email уже є в команді.'
          : 'Не вдалося зберегти. Спробуйте ще раз.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  protected askDelete(member: Member): void {
    this.target.set(member);
    this.confirmOpen.set(true);
  }

  protected readonly remove = async (): Promise<void> => {
    const member = this.target();
    if (!member) return;
    await this.api.remove(member.id);
    this.members.update((list) => list.filter((m) => m.id !== member.id));
    this.toaster.success('Учасника видалено', member.name);
  };

  private openEditor(): void {
    this.editor().show();
  }

  private closeEditor(): void {
    this.editor().close('saved');
  }
}
