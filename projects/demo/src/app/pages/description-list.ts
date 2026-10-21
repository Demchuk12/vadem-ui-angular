import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VdBadge } from '@vadem/ui/badge';
import { VdCopyButton } from '@vadem/ui/copy-button';
import { VdDescriptionList } from '@vadem/ui/description-list';

@Component({
  selector: 'demo-description-list',
  imports: [VdDescriptionList, VdBadge, VdCopyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-page-head">
      <p class="vd-eyebrow">Components / Description list</p>
      <h1>Description list</h1>
      <p>
        Readable names and values for equipment, profiles and records. Native content stays
        selectable.
      </p>
    </header>

    <section class="demo-section" aria-labelledby="equipment-details">
      <div class="demo-section__head">
        <h2 id="equipment-details">Equipment details</h2>
        <p>Aligned terms on wide containers; stacked pairs when space is limited.</p>
      </div>
      <div class="demo-panel">
        <dl vdDescriptionList aria-labelledby="equipment-details" data-testid="equipment">
          <div>
            <dt>Обладнання</dt>
            <dd>Охолоджувальна установка № 4</dd>
          </div>
          <div>
            <dt>Стан</dt>
            <dd><span vdBadge variant="success">Працює</span></dd>
          </div>
          <div>
            <dt>Ідентифікатор</dt>
            <dd class="demo-description-actions">
              <bdi>VDM-COOL-004</bdi
              ><vd-copy-button value="VDM-COOL-004" label="Копіювати ідентифікатор" />
            </dd>
          </div>
          <div>
            <dt>Відповідальна</dt>
            <dd><a href="mailto:olena@example.com">Олена Ковальчук</a></dd>
          </div>
          <div>
            <dt>Температура</dt>
            <dd>4,2 °C</dd>
          </div>
          <div>
            <dt>Невиконані завдання</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>Наступне обслуговування</dt>
            <dd>Не заплановано</dd>
          </div>
          <div>
            <dt>
              Примітка для відповідальної команди технічного обслуговування та контролю якості
            </dt>
            <dd>
              Після завершення поточної зміни перевірити герметичність з’єднань і внести результати
              до журналу обслуговування.
            </dd>
          </div>
          <div>
            <dt>Серійний номер</dt>
            <dd><bdi>UA2026COOLINGUNITPRODUCTIONLINE000000000004</bdi></dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="description-layouts">
      <div class="demo-section__head">
        <h2 id="description-layouts">Vertical and RTL</h2>
        <p>Direction follows the content. Identifiers keep their own reading order.</p>
      </div>
      <div class="demo-grid" style="--demo-min: min(20rem, 100%)">
        <div class="demo-panel">
          <h3 id="profile-details">Контактна інформація</h3>
          <dl
            vdDescriptionList
            layout="vertical"
            aria-labelledby="profile-details"
            data-testid="profile"
          >
            <div>
              <dt>Ім’я</dt>
              <dd>Марко Демченко</dd>
            </div>
            <div>
              <dt>Команда</dt>
              <dd>Виробництво та контроль якості</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd>Не вказано</dd>
            </div>
            <div>
              <dt>Робочі адреси</dt>
              <dd><a href="mailto:marko@example.com">marko&#64;example.com</a></dd>
              <dd><a href="mailto:quality@example.com">quality&#64;example.com</a></dd>
            </div>
          </dl>
        </div>
        <div class="demo-panel" dir="rtl" lang="ar">
          <h3 id="arabic-details">تفاصيل الجهاز</h3>
          <dl vdDescriptionList aria-labelledby="arabic-details" data-testid="arabic">
            <div>
              <dt>الجهاز</dt>
              <dd>وحدة التبريد الرئيسية</dd>
            </div>
            <div>
              <dt>الحالة</dt>
              <dd><span vdBadge variant="warning">بانتظار الفحص</span></dd>
            </div>
            <div>
              <dt>الرقم التسلسلي</dt>
              <dd><bdi>VDM-COOL-005</bdi></dd>
            </div>
            <div>
              <dt>المسؤول</dt>
              <dd><a href="mailto:nour@example.com">نور أحمد</a></dd>
            </div>
            <div>
              <dt>موعد الصيانة</dt>
              <dd>لم يتم تحديده بعد</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="description-content">
      <div class="demo-section__head">
        <h2 id="description-content">Content groups and empty records</h2>
        <p>
          Native groups can contain several terms or values. Empty records use explicit application
          copy.
        </p>
      </div>
      <div class="demo-panel">
        <dl vdDescriptionList aria-labelledby="description-content" data-testid="groups">
          <div>
            <dt>Власник</dt>
            <dt>Контактна особа</dt>
            <dd>Ірина Шевченко</dd>
            <dd>Відділ постачання</dd>
          </div>
          <div>
            <dt>Документи</dt>
            <dd>
              <ul>
                <li>Паспорт обладнання</li>
                <li>Акт введення в експлуатацію</li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
      <div class="demo-panel">
        <h3>Реквізити ще не додано</h3>
        <p>Після заповнення картки тут з’являться назва організації та контактні дані.</p>
      </div>
    </section>
  `,
  styles: `
    .demo-description-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--vd-space-2);
    }
    .demo-description-actions bdi {
      min-inline-size: 0;
    }
    demo-description-list h3 {
      font-size: var(--vd-text-base);
    }
  `,
})
export default class DescriptionListPage {}
