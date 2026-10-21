import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VdAvatar, VdAvatarGroup, VdAvatarSize } from '@vadem/ui/avatar';
import { VD_CARD } from '@vadem/ui/card';

// Inline SVG "photos": no external runtime assets in the demo either.
const photo = (a: string, b: string) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="#fff" fill-opacity=".85"/><path d="M12 64c2-14 10-20 20-20s18 6 20 20z" fill="#fff" fill-opacity=".85"/></svg>`,
  );

@Component({
  selector: 'demo-avatar',
  imports: [VD_CARD, VdAvatar, VdAvatarGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Avatar</p>
      <h1>Avatar</h1>
      <p>
        A photo with an initials fallback: no photo, or one that fails to load. Named images by
        default; decorative when the name is already shown next to it.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="sizes">
      <div class="demo-section__head">
        <p class="vd-eyebrow">size · src · fallback</p>
        <h2 id="sizes">Sizes</h2>
      </div>
      <div class="demo-panel demo-stack">
        @for (size of sizes; track size) {
          <div class="demo-row">
            <vd-avatar [size]="size" name="Олена Коваленко" />
            <vd-avatar [size]="size" name="Тарас Мельник" [src]="photoA" />
            <vd-avatar [size]="size" name="Ірина Бондар" src="/missing-photo.png" />
            <span class="demo-token">{{ size }}</span>
          </div>
        }
        <p class="demo-muted">
          Третій аватар має зламане посилання на фото, тому показує ініціали.
        </p>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="group">
      <div class="demo-section__head">
        <p class="vd-eyebrow">[vdAvatarGroup] · initials="+3"</p>
        <h2 id="group">Groups</h2>
        <p>The ring matches the surface behind it, so overlaps read as cut-outs.</p>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <div class="demo-plain">
          <div vdAvatarGroup aria-label="Команда Mobile">
            <vd-avatar name="Олена Коваленко" [src]="photoA" />
            <vd-avatar name="Тарас Мельник" />
            <vd-avatar name="Ірина Бондар" [src]="photoB" />
            <vd-avatar name="Андрій Шевчук" />
            <vd-avatar name="Ще 3 учасники" initials="+3" />
          </div>
        </div>
        <article vdCard>
          <header vdCardHeader>
            <h3 vdCardTitle>Платформа оплат</h3>
            <p vdCardDescription>5 учасників · eu-central-1</p>
          </header>
          <div vdAvatarGroup aria-label="Учасники проєкту">
            <vd-avatar size="sm" name="Олена Коваленко" [src]="photoB" />
            <vd-avatar size="sm" name="Андрій Шевчук" />
            <vd-avatar size="sm" name="Тарас Мельник" [src]="photoA" />
            <vd-avatar size="sm" name="Ще 2 учасники" initials="+2" />
          </div>
        </article>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="content">
      <div class="demo-section__head">
        <p class="vd-eyebrow">decorative · realistic content</p>
        <h2 id="content">With names, RTL</h2>
      </div>
      <div class="demo-grid" style="--demo-min: 18rem">
        <ul class="demo-panel demo-people" role="list">
          @for (p of people; track p.name) {
            <li>
              <vd-avatar [name]="p.name" [src]="p.src" decorative />
              <span>
                <strong>{{ p.name }}</strong>
                <span class="demo-muted">{{ p.role }}</span>
              </span>
            </li>
          }
        </ul>
        <ul class="demo-panel demo-people" role="list" dir="rtl" lang="ar">
          <li>
            <vd-avatar name="ليلى حسن" decorative />
            <span><strong>ليلى حسن</strong><span class="demo-muted">مصممة</span></span>
          </li>
          <li>
            <vd-avatar name="عمر خالد" [src]="photoA" decorative />
            <span><strong>عمر خالد</strong><span class="demo-muted">مطور</span></span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: `
    .demo-stack {
      display: grid;
      gap: var(--vd-space-4);
    }
    .demo-row {
      display: flex;
      align-items: center;
      gap: var(--vd-space-4);
    }
    .demo-muted {
      color: var(--vd-color-text-muted);
      font-size: var(--vd-text-sm);
    }
    .demo-plain {
      display: grid;
      align-content: center;
      padding: var(--vd-space-6);
    }
    .vd-avatar-group {
      flex-wrap: wrap;
      max-inline-size: 100%;
    }
    .demo-people {
      display: grid;
      gap: var(--vd-space-4);
      margin: 0;
    }
    .demo-people li {
      display: flex;
      align-items: center;
      gap: var(--vd-space-3);
    }
    .demo-people li > span {
      display: grid;
      min-inline-size: 0;
    }
  `,
})
export default class AvatarPage {
  protected readonly sizes: VdAvatarSize[] = ['sm', 'md', 'lg', 'xl'];
  protected readonly photoA = photo('#7c6cf2', '#2a1f6b');
  protected readonly photoB = photo('#3fb6a8', '#134a52');
  protected readonly people = [
    { name: 'Олена Коваленко', role: 'Дизайнерка інтерфейсів', src: this.photoB },
    { name: 'Тарас Мельник', role: 'Мобільна розробка', src: undefined },
    {
      name: 'Анна-Марія Шевчук-Коваль',
      role: 'Продакт-менеджерка, платформа оплат',
      src: undefined,
    },
  ];
}
