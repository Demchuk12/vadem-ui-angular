import { Pipe, inject, type PipeTransform } from '@angular/core';
import { VD_LOCALE } from '@vadem/ui/locale';
import { vdFormatFileSize, type VdFileSizeSystem } from './core/file-size';

@Pipe({ name: 'vdFileSize' })
export class VdFileSizePipe implements PipeTransform {
  private readonly texts = inject(VD_LOCALE);
  transform(
    bytes: number | null | undefined,
    system: VdFileSizeSystem = 'decimal',
    maximumFractionDigits = 1,
    locale = this.texts.code,
    unknownText = this.texts.fileSize.unknownText,
  ): string {
    return vdFormatFileSize(bytes, { system, maximumFractionDigits, locale, unknownText });
  }
}
